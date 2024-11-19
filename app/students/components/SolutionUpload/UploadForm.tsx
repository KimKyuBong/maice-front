"use client";

import { useState, type ChangeEvent } from 'react';
import ImageEditor from './ImageEditor';
import type { UploadFormProps } from './types';

export default function UploadForm({
    mathTopic,
    setMathTopic,
    selectedFile,
    previewUrl,
    isSubmitting,
    studentId,
    onFileSelect,
    onSubmit
}: UploadFormProps) {
    const handleCropComplete = (croppedImage: Blob) => {
        const file = new File([croppedImage], selectedFile?.name || 'cropped-image.jpg', {
            type: 'image/jpeg'
        });

        // FileList 객체 생성
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        // React ChangeEvent 생성
        const syntheticEvent = {
            target: {
                files: dataTransfer.files,
                value: '',
                name: 'solutionImage',
                type: 'file'
            },
            preventDefault: () => {},
            stopPropagation: () => {},
        } as ChangeEvent<HTMLInputElement>;

        onFileSelect(syntheticEvent);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6" encType="multipart/form-data">
            <div>
                <label htmlFor="mathTopic" className="block text-sm font-medium text-gray-700">
                    수학 주제
                </label>
                <select
                    id="mathTopic"
                    value={mathTopic}
                    onChange={(e) => setMathTopic(e.target.value)}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="algebra">대수</option>
                    <option value="geometry">기하</option>
                    <option value="calculus">미적분</option>
                    <option value="probability">확률과 통계</option>
                    <option value="other">기타</option>
                </select>
            </div>

            <div>
                <span id="image-input-label" className="block text-sm font-medium text-gray-700 mb-2">
                    풀이 이미지
                </span>
                <div className="space-y-4" aria-labelledby="image-input-label">
                    <input
                        id="solutionImage"
                        type="file"
                        accept="image/*"
                        onChange={onFileSelect}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                    />
                </div>
            </div>

            {previewUrl && (
                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        이미지에서 평가하고자 하는 영역을 선택하세요
                    </p>
                    <ImageEditor
                        imageUrl={previewUrl}
                        onCropComplete={handleCropComplete}
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !selectedFile || !studentId}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? '제출 중...' : '풀이 제출하기'}
            </button>
        </form>
    );
}