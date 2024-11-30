"use client";

import { useState, useEffect } from 'react';
import ImageEditor from './ImageEditor';
import type { UploadFormProps } from './types';

export default function UploadForm({
    selectedFile,
    previewUrl,
    isSubmitting,
    studentId,
    selectedProblemKey,
    onFileSelect,
    onSubmit
}: UploadFormProps) {
    const [showEditor, setShowEditor] = useState(false);

    // previewUrl이 변경될 때마다 편집기를 자동으로 표시
    useEffect(() => {
        if (previewUrl) {
            setShowEditor(true);
        }
    }, [previewUrl]);

    const handleCropComplete = async (croppedImage: Blob) => {
        setShowEditor(false);
        // Blob을 File 객체로 변환
        const file = new File([croppedImage], selectedFile?.name || 'cropped-image.jpg', {
            type: croppedImage.type
        });
        
        // 파일 선택 이벤트 시뮬레이션
        const event = {
            target: {
                files: [file]
            }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        
        onFileSelect(event);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            setShowEditor(true);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label 
                    htmlFor="solution-image" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    답안 이미지
                </label>
                <input
                    type="file"
                    id="solution-image"
                    accept="image/*"
                    onChange={onFileSelect}
                    disabled={isSubmitting}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
            </div>

            {previewUrl && !showEditor && (
                <div className="mt-4">
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full h-auto" 
                    />
                </div>
            )}

            {showEditor && previewUrl && (
                <ImageEditor
                    imageUrl={previewUrl}
                    onCropComplete={handleCropComplete}
                />
            )}

            <button
                type="submit"
                disabled={!selectedFile || isSubmitting || !studentId || !selectedProblemKey}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isSubmitting ? '제출 중...' : '제출하기'}
            </button>
        </form>
    );
}