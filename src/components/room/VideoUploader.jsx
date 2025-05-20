import { useState } from 'react';
import { driveService } from '../../utils/googleDrive';
import { motion } from 'framer-motion';

const VideoUploader = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload to Google Drive
      const { fileId, webContentLink } = await driveService.uploadFile(file);

      onUploadComplete({
        fileId,
        url: webContentLink,
        name: file.name,
      });
    } catch (error) {
      setError('Failed to upload video. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-effect p-6 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="w-full mb-4">
            <label
              htmlFor="video-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                ${uploading ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 hover:border-primary-500 bg-gray-800/50'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {!uploading ? (
                  <>
                    <svg
                      className="w-8 h-8 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">MP4, MKV, or WebM (MAX. 2GB)</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-300">Uploading... {progress}%</p>
                  </div>
                )}
              </div>
              <input
                id="video-upload"
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <p className="text-xs text-gray-400 text-center">
            By uploading, you confirm that you have the rights to share this content
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;