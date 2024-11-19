"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditorProps {
    imageUrl: string;
    onCropComplete: (croppedImage: Blob) => void;
}

export default function ImageEditor({ imageUrl, onCropComplete }: ImageEditorProps) {
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 100,
        height: 100,
        x: 0,
        y: 0
    });
    const [rotation, setRotation] = useState(0);
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [isEditing, setIsEditing] = useState(true);
    const [history, setHistory] = useState<{rotation: number, crop: Crop}[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawMode, setDrawMode] = useState<'pen' | 'eraser' | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const initCanvas = useCallback((img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineCap = 'round';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        contextRef.current = context;
        
        const tempImage = new Image();
        tempImage.src = imageUrl;
        tempImage.onload = () => {
            context.drawImage(tempImage, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            setCanvasHistory([imageData]);
        };
    }, [imageUrl]);

    const onImageLoad = useCallback((img: HTMLImageElement) => {
        setImageRef(img);
        if (drawMode) {
            initCanvas(img);
        }
    }, [initCanvas, drawMode]);

    useEffect(() => {
        if (drawMode && imageRef) {
            initCanvas(imageRef);
        }
    }, [drawMode, imageRef, initCanvas]);

    const getMousePos = useCallback((canvas: HTMLCanvasElement, e: React.MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / (rect.width * scale);
        const scaleY = canvas.height / (rect.height * scale);
        
        return {
            x: (e.clientX - rect.left - position.x) * scaleX,
            y: (e.clientY - rect.top - position.y) * scaleY
        };
    }, [scale, position]);

    const startDrawing = useCallback((e: React.MouseEvent) => {
        if (!drawMode || !contextRef.current) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getMousePos(canvas, e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    }, [drawMode, getMousePos]);

    const draw = useCallback((e: React.MouseEvent) => {
        if (!isDrawing || !drawMode || !contextRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getMousePos(canvas, e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    }, [isDrawing, drawMode, getMousePos]);

    const stopDrawing = useCallback(() => {
        if (!isDrawing || !contextRef.current || !canvasRef.current) return;

        contextRef.current.closePath();
        setIsDrawing(false);

        const imageData = contextRef.current.getImageData(
            0, 0, canvasRef.current.width, canvasRef.current.height
        );
        setCanvasHistory(prev => [...prev, imageData]);
    }, [isDrawing]);

    const handleConfirmCrop = useCallback(async () => {
        if (!imageRef || !crop.width || !crop.height) return;

        setHistory(prev => [...prev, { rotation, crop }]);
        setIsEditing(false);

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;
        
        const rotatedWidth = Math.abs(crop.width * Math.cos(rotation * Math.PI / 180)) + 
                            Math.abs(crop.height * Math.sin(rotation * Math.PI / 180));
        const rotatedHeight = Math.abs(crop.width * Math.sin(rotation * Math.PI / 180)) + 
                             Math.abs(crop.height * Math.cos(rotation * Math.PI / 180));
        
        canvas.width = rotatedWidth * scaleX;
        canvas.height = rotatedHeight * scaleY;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-canvas.width/2, -canvas.height/2);

        ctx.drawImage(
            imageRef,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            (canvas.width - crop.width * scaleX) / 2,
            (canvas.height - crop.height * scaleY) / 2,
            crop.width * scaleX,
            crop.height * scaleY
        );

        canvas.toBlob(
            (blob) => {
                if (blob) onCropComplete(blob);
            },
            'image/jpeg',
            1
        );
    }, [imageRef, crop, rotation, onCropComplete]);

    const handleUndo = useCallback(() => {
        if (drawMode) {
            if (canvasHistory.length > 1) {
                const previousState = canvasHistory[canvasHistory.length - 2];
                const context = contextRef.current;
                if (!context || !canvasRef.current) return;

                context.putImageData(previousState, 0, 0);
                setCanvasHistory(prev => prev.slice(0, -1));
            }
        } else {
            const previousState = history[history.length - 1];
            if (previousState) {
                setRotation(previousState.rotation);
                setCrop(previousState.crop);
                setHistory(prev => prev.slice(0, -1));
            } else {
                setRotation(0);
                setCrop({
                    unit: '%',
                    width: 100,
                    height: 100,
                    x: 0,
                    y: 0
                });
            }
        }
        setIsEditing(true);
    }, [history, drawMode, canvasHistory]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            setScale(prevScale => {
                const newScale = Math.min(Math.max(0.1, prevScale + delta), 5);
                return newScale;
            });
        }
    }, []);

    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    }, [position]);

    const handleDrag = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, dragStart]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    return (
        <div 
            className="space-y-1"
            onWheel={handleWheel}
            onMouseDown={handleDragStart}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
        >
            <div className="relative w-full overflow-hidden" style={{ height: '600px' }}>
                {isEditing ? (
                    drawMode ? (
                        <div 
                            className="relative w-full h-full"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px)`,
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="cursor-crosshair"
                                style={{
                                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                                    transformOrigin: 'center center',
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
                            />
                        </div>
                    ) : (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            className="max-w-full"
                        >
                            <img
                                src={imageUrl}
                                onLoad={(e) => onImageLoad(e.currentTarget)}
                                alt="Crop me"
                                className="w-full h-auto"
                                style={{
                                    transform: `rotate(${rotation}deg)`
                                }}
                            />
                        </ReactCrop>
                    )
                ) : (
                    <img
                        src={imageUrl}
                        alt="Cropped result"
                        className="w-full h-auto"
                        style={{
                            transform: `rotate(${rotation}deg)`
                        }}
                    />
                )}
            </div>
            
            <div className="flex items-center space-x-4 bg-white py-1.5 px-3 rounded-lg shadow-sm">
                <div className="flex-1">
                    {!drawMode ? (
                        <>
                            <label htmlFor="rotation" className="block text-sm font-medium text-gray-700 mb-0.5">
                                회전 ({rotation}°)
                            </label>
                            <input
                                id="rotation"
                                type="range"
                                min="-180"
                                max="180"
                                value={rotation}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                disabled={!isEditing}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (contextRef.current) {
                                            contextRef.current.strokeStyle = '#000000';
                                            contextRef.current.lineWidth = 2;
                                        }
                                        setDrawMode('pen');
                                    }}
                                    className={`px-3 py-1.5 rounded-md ${
                                        drawMode === 'pen' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    펜
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (contextRef.current) {
                                            contextRef.current.strokeStyle = '#ffffff';
                                            contextRef.current.lineWidth = 20;
                                        }
                                        setDrawMode('eraser');
                                    }}
                                    className={`px-3 py-1.5 rounded-md ${
                                        drawMode === 'eraser' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    지우개
                                </button>
                            </div>
                            <div>
                                <label 
                                    htmlFor="zoom-control" 
                                    className="block text-sm font-medium text-gray-700 mb-0.5"
                                >
                                    확대/축소 ({Math.round(scale * 100)}%)
                                </label>
                                <input
                                    id="zoom-control"
                                    type="range"
                                    min="10"
                                    max="500"
                                    value={scale * 100}
                                    onChange={(e) => setScale(Number(e.target.value) / 100)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={handleUndo}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            실행 취소
                        </button>
                    )}
                    {isEditing && (
                        <>
                            <button
                                type="button"
                                onClick={() => setDrawMode(drawMode ? null : 'pen')}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                {drawMode ? '자르기 모드' : '그리기 모드'}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCrop}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                선택 영역 확인
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 