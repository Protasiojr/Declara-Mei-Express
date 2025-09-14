import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface BarcodeScannerProps {
    onScanSuccess: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>('');
    const { t } = useTranslation();

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            if (!('BarcodeDetector' in window)) {
                setError(t('sales.barcodeDetectorNotSupported'));
                return;
            }

            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
                setError(t('sales.cameraPermissionDenied'));
            }
        };
        startCamera();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [t]);

    useEffect(() => {
        if (!videoRef.current) return;
        
        // @ts-ignore
        const barcodeDetector = new window.BarcodeDetector({ formats: ['ean_13', 'codabar', 'code_128', 'qr_code'] });
        let animationFrameId: number;

        const detectBarcode = async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                try {
                    const barcodes = await barcodeDetector.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        onScanSuccess(barcodes[0].rawValue);
                        return; // Stop scanning after success
                    }
                } catch (e) {
                    console.error('Barcode detection failed:', e);
                }
            }
            animationFrameId = requestAnimationFrame(detectBarcode);
        };

        const videoElement = videoRef.current;
        videoElement.addEventListener('loadeddata', () => {
            animationFrameId = requestAnimationFrame(detectBarcode);
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [onScanSuccess]);

    return (
        <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
            {error ? (
                <div className="flex items-center justify-center h-full text-white p-4 text-center">
                    {error}
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="w-full h-1/3 border-4 border-dashed border-white/50 rounded-lg"></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BarcodeScanner;
