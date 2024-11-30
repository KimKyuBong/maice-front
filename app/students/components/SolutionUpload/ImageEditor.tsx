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
        unit: 'px',
        width: 0,
        height: 0,
        x: 0,
        y: 0
    });
    const [rotation, setRotation] = useState(0);
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [isEditing, setIsEditing] = useState(true);
    const [highContrast, setHighContrast] = useState(false);
    const [grayscale, setGrayscale] = useState(false);
    const [imageHeight, setImageHeight] = useState<number>(0);
    const [croppedUrl, setCroppedUrl] = useState<string>(imageUrl);
    const [isProcessing, setIsProcessing] = useState(false);

    const onImageLoad = useCallback((img: HTMLImageElement) => {
        setImageRef(img);
        // 이미지 비율에 맞춰 높이 계산
        const containerWidth = img.parentElement?.clientWidth || 0;
        const ratio = containerWidth / img.naturalWidth;
        const calculatedHeight = img.naturalHeight * ratio;
        setImageHeight(calculatedHeight);
        
        setCrop({
            unit: 'px',
            width: img.width,
            height: img.height,
            x: 0,
            y: 0
        });
    }, []);

    const toggleCropMode = useCallback(async () => {
        if (isEditing) {
            // 크롭 모드에서 확인 버튼 클릭 시
            if (imageRef && crop.width && crop.height) {
                setIsProcessing(true);
                const canvas = document.createElement('canvas');
                const scaleX = imageRef.naturalWidth / imageRef.width;
                const scaleY = imageRef.naturalHeight / imageRef.height;
                
                canvas.width = crop.width * scaleX;
                canvas.height = crop.height * scaleY;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setIsProcessing(false);
                    return;
                }

                if (rotation !== 0) {
                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.rotate(rotation * Math.PI / 180);
                    ctx.translate(-canvas.width/2, -canvas.height/2);
                }

                ctx.drawImage(
                    imageRef,
                    crop.x * scaleX,
                    crop.y * scaleY,
                    crop.width * scaleX,
                    crop.height * scaleY,
                    0,
                    0,
                    crop.width * scaleX,
                    crop.height * scaleY
                );

                if (highContrast || grayscale) {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        
                        if (highContrast) {
                            const threshold = 128;
                            const value = avg > threshold ? 255 : 0;
                            data[i] = data[i + 1] = data[i + 2] = value;
                        } else if (grayscale) {
                            data[i] = data[i + 1] = data[i + 2] = avg;
                        }
                    }
                    
                    ctx.putImageData(imageData, 0, 0);
                }

                await new Promise<void>((resolve) => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const newUrl = URL.createObjectURL(blob);
                                setCroppedUrl(newUrl);
                                if (!isEditing) {
                                    onCropComplete(blob);
                                }
                            }
                            resolve();
                        },
                        'image/jpeg',
                        1
                    );
                });
                
                setIsProcessing(false);
            }
            setIsEditing(false);  // 크롭 모드 비활성화
        } else {
            // 다시 크롭 모드로 돌아갈 때
            setIsEditing(true);
            setCroppedUrl(imageUrl);  // 원본 이미지 URL로 복원
            if (imageRef) {
                setCrop({
                    unit: 'px',
                    width: imageRef.width,
                    height: imageRef.height,
                    x: 0,
                    y: 0
                });
            }
            setRotation(0);  // 회전 초기화
            setHighContrast(false);  // 고대비 초기화
            setGrayscale(false);  // 흑백 초기화
        }
    }, [imageRef, crop, rotation, highContrast, grayscale, isEditing, onCropComplete, imageUrl]);

    // 최종 확정 버튼 추가
    const handleConfirm = useCallback(() => {
        if (!isEditing && croppedUrl !== imageUrl) {
            fetch(croppedUrl)
                .then(res => res.blob())
                .then(blob => {
                    onCropComplete(blob);
                });
        }
    }, [croppedUrl, imageUrl, isEditing, onCropComplete]);

    // 컴포넌트 언마운트 시 URL 정리
    useEffect(() => {
        return () => {
            if (croppedUrl !== imageUrl) {
                URL.revokeObjectURL(croppedUrl);
            }
        };
    }, [croppedUrl, imageUrl]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-4 bg-white py-2 px-4 rounded-lg shadow-sm">
                <div className="flex-1">
                    <label htmlFor="rotation" className="block text-sm font-medium text-gray-700 mb-1">
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
                    />
                </div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setHighContrast(!highContrast)}
                        className={`px-4 py-2 rounded-md ${
                            highContrast 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700'
                        }`}
                        disabled={isProcessing}
                    >
                        고대비
                    </button>
                    <button
                        type="button"
                        onClick={() => setGrayscale(!grayscale)}
                        className={`px-4 py-2 rounded-md ${
                            grayscale 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700'
                        }`}
                        disabled={isProcessing}
                    >
                        흑백
                    </button>
                    <button
                        type="button"
                        onClick={toggleCropMode}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-md ${
                            !isEditing 
                                ? 'bg-gray-600 text-white' 
                                : 'bg-blue-600 text-white'
                        }`}
                    >
                        {isEditing ? '선택 영역 확인' : '영역 다시 선택'}
                    </button>
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-2 rounded-md bg-green-600 text-white"
                        >
                            편집 완료
                        </button>
                    )}
                </div>
            </div>

            <div className="relative w-full overflow-hidden rounded-lg bg-gray-50" 
                 style={{ height: imageHeight || 'auto' }}>
                {isEditing ? (
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        className="w-full h-full"
                        minWidth={100}
                        minHeight={100}
                        keepSelection
                        ruleOfThirds
                    >
                        <img
                            src={imageUrl}  // 항상 원본 이미지 사용
                            onLoad={(e) => onImageLoad(e.currentTarget)}
                            alt="Crop me"
                            className="w-full h-full object-contain"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                filter: `
                                    ${highContrast ? 'contrast(200%)' : ''}
                                    ${grayscale ? 'grayscale(100%)' : ''}
                                `
                            }}
                        />
                    </ReactCrop>
                ) : (
                    <div className="w-full h-full">
                        <img
                            src={croppedUrl}  // 크롭된 이미지 URL 사용
                            alt="Cropped result"
                            className="w-full h-full object-contain"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                filter: `
                                    ${highContrast ? 'contrast(200%)' : ''}
                                    ${grayscale ? 'grayscale(100%)' : ''}
                                `
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 