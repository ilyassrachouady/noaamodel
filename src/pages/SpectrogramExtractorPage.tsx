import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { RawFile } from '../context/DataContext'; // Assuming RawFile interface is exported
import { S3Service } from '../services/s3Service'; // We'll add extractSpectrogram here later
import { ChevronDown, Loader, AlertTriangle, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpectrogramExtractorPage: React.FC = () => {
  const { rawFiles, isLoading: dataLoading, error: dataError } = useData();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [spectrogramImage, setSpectrogramImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Bonus: For caching
  const [cachedSpectrograms, setCachedSpectrograms] = useState<Record<string, string>>({});

  useEffect(() => {
    // If there's a dataError from useData, display it
    if (dataError) {
      setError(`Error loading file list: ${dataError}`);
    }
  }, [dataError]);

  // Effect to clean up object URLs
  useEffect(() => {
    return () => {
      if (spectrogramImage) {
        URL.revokeObjectURL(spectrogramImage);
      }
      // Clean up all cached object URLs as well if component unmounts
      Object.values(cachedSpectrograms).forEach(url => URL.revokeObjectURL(url));
    };
  }, [spectrogramImage, cachedSpectrograms]);

  const handleFileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filePath = event.target.value;
    setSelectedFile(filePath);
    setError(null); // Clear previous errors
    setSpectrogramImage(null); // Clear previous image

    // Bonus: Check cache
    if (cachedSpectrograms[filePath]) {
      setSpectrogramImage(cachedSpectrograms[filePath]);
    }
  };

  const handleGenerateSpectrogram = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    // Bonus: Check cache first
    if (cachedSpectrograms[selectedFile]) {
      setSpectrogramImage(cachedSpectrograms[selectedFile]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSpectrogramImage(null);

    try {
      // Construct the full file path if necessary.
      // The backend expects a path like "data/2107RL_CW-D20211013-T224036.raw".
      // rawFiles from S3Service.fetchFileList might just be "2107RL_CW-D20211013-T224036.raw"
      // We need to ensure the path is correct. Let's assume filenames in rawFiles are direct names
      // and we might need to prefix them. The s3Service.getDownloadUrl provides a hint with its PREFIX.
      // The backend code shows `file_path: str = Field(..., description="Path to .raw file")` for /extract-signatures
      // and the example is `data/2107RL_CW-D20211013-T224036.raw`.
      // Let's assume the file names in `rawFiles` are the ones to be used directly for now,
      // and the backend is configured to find them based on that name within its expected S3 structure.
      // If not, this `filePathForApi` will need adjustment.
      // The problem description for the backend path is: `POST .../extract-spectrogram` with JSON body `{"file_path": "data/2107RL_CW-D20211013-T224036.raw"}`
      // This implies the "data/" prefix IS needed.
      // Let's find the selected RawFile object to get its cruise, though the backend doesn't seem to use it for this endpoint.
      // The file path for the API should match the example.
      // The `s3Service.ts` has `PREFIX = "data/raw/Reuben_Lasker/RL2107/EK80"`
      // The `generate-echogram` endpoint takes `filename` as query param.
      // The `/extract-spectrogram` endpoint takes `file_path` in body.
      // The `file.url` in `RawFile` from `s3Service` is the full S3 URL.
      // The `file.filename` is like `2107RL_CW-D20211013-T224036.raw`.
      // The crucial part is what the `/extract-spectrogram` backend endpoint expects for `file_path`.
      // Based on the example `data/2107RL_CW-D20211013-T224036.raw`, it seems like a relative path.
      // And the `filename` from `rawFiles` seems to be the base name.
      // Let's assume a structure like `data/${filename}` is NOT what's needed, but rather the backend
      // knows how to map the filename to its internal storage.
      // The backend example `POST ... { "file_path": "data/2107RL_CW-D20211013-T224036.raw" }`
      // This `file_path` is likely relative to some root in the S3 bucket the backend is configured for.
      // The `S3Service.fetchFileList` returns files with `filename` like "2107RL_CW-D20211013-T224036.raw".
      // The backend's S3 `PREFIX` is "data/raw/Reuben_Lasker/RL2107/EK80".
      // So, the full path in S3 would be `data/raw/Reuben_Lasker/RL2107/EK80/2107RL_CW-D20211013-T224036.raw`.
      // The `/generate-echogram` endpoint seems to use this full path implicitly.
      // The `/extract-spectrogram` endpoint example `data/2107RL_CW-D20211013-T224036.raw` is confusing.
      // Let's try to match the example path format for now. If `rawFiles[x].filename` is `2107RL_CW-D20211013-T224036.raw`,
      // then `file_path` should be `data/2107RL_CW-D20211013-T224036.raw`.
      // This means we need to prefix "data/" to the filename.
      // This seems brittle. A better way would be if `rawFiles` included the necessary path segment or if the API took just the filename.
      // Given the prompt strictly says: ` "file_path": "data/2107RL_CW-D20211013-T224036.raw" `
      // I will construct this path.

      const filePathForApi = `data/${selectedFile}`;

      const imageBlob = await S3Service.extractSpectrogram(filePathForApi);

      if (spectrogramImage) {
        // Clean up previous object URL to prevent memory leaks
        URL.revokeObjectURL(spectrogramImage);
      }

      const imageUrl = URL.createObjectURL(imageBlob);

      setSpectrogramImage(imageUrl);
      // Bonus: Update cache
      setCachedSpectrograms(prev => ({ ...prev, [selectedFile]: imageUrl }));

    } catch (err) {
      console.error('Error generating spectrogram:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate spectrogram. Check console for details.');
      setSpectrogramImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading && rawFiles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-12 w-12 text-teal-400 animate-spin" />
        <p className="ml-4 text-xl text-white/80">Loading available files...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-white">
      <header className="text-center mb-12">
        <FileText className="h-16 w-16 text-teal-300 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Spectrogram Extractor</h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Select a <code className="bg-white/10 px-1 py-0.5 rounded-md font-mono text-teal-300">.raw</code> file from the RL2107 dataset, then generate and view its acoustic spectrogram.
        </p>
      </header>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="space-y-6">
          {/* File Selector */}
          <div>
            <label htmlFor="file-select" className="block text-sm font-medium text-white/80 mb-1">
              Choose a .raw file:
            </label>
            <div className="relative">
              <select
                id="file-select"
                value={selectedFile}
                onChange={handleFileChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 appearance-none"
                disabled={rawFiles.length === 0 || isLoading}
              >
                <option value="" disabled className="text-gray-500">
                  {rawFiles.length === 0 ? 'No files available or error loading files' : 'Select a file...'}
                </option>
                {rawFiles.map((file) => (
                  <option key={file.filename} value={file.filename} className="bg-gray-800 text-white">
                    {file.filename} ({file.formattedSize})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
            </div>
            {dataError && !selectedFile && (
                 <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertTriangle size={16} className="mr-1" /> Error loading files: {dataError}
                 </p>
            )}
          </div>

          {/* Generate Button */}
          <div>
            <button
              onClick={handleGenerateSpectrogram}
              disabled={!selectedFile || isLoading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  Generating...
                </>
              ) : (
                'Generate Spectrogram'
              )}
            </button>
          </div>

          {/* User Tip */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm flex items-start">
            <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Tip:</span> Large files may take longer to process. Avoid repeated processing of the same file unless necessary. Cached results will be shown if available.
            </div>
          </div>

        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg flex items-center"
            role="alert"
          >
            <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spectrogram Display Area */}
      <AnimatePresence>
      {isLoading && !spectrogramImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-8 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 min-h-[300px]"
        >
          <Loader className="h-12 w-12 text-teal-400 animate-spin mb-4" />
          <p className="text-xl text-white/80">Generating Spectrogram...</p>
          <p className="text-sm text-white/60">This may take a moment for larger files.</p>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {spectrogramImage && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <ImageIcon size={24} className="mr-3 text-teal-300" />
              Spectrogram Preview
            </h2>
            <p className="text-sm text-white/70 mb-1">File: <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-teal-300">{selectedFile}</code></p>
            <p className="text-sm text-white/70 mb-4">Multi-frequency target segment (visualization)</p>
            <div className="bg-black/20 rounded-lg overflow-hidden border border-white/10">
              <img
                src={spectrogramImage}
                alt="Generated Spectrogram"
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && !spectrogramImage && !error && selectedFile && (
         <div className="mt-8 text-center text-white/60 p-8 bg-white/5 rounded-2xl border border-white/10">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Spectrogram will appear here once generated.</p>
         </div>
      )}

      {!selectedFile && !dataLoading && !dataError && (
         <div className="mt-8 text-center text-white/50 p-8 bg-white/5 rounded-2xl border border-white/10">
            <FileText size={48} className="mx-auto mb-4 opacity-40" />
            <p>Please select a file from the dropdown above to begin.</p>
         </div>
      )}

    </div>
  );
};

export default SpectrogramExtractorPage;
