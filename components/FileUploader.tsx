"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import Dropzone from "react-dropzone";
import { CloudUploadIcon, File, Loader } from "lucide-react";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { useSignInModal } from "@/hooks/use-signin-modal";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
//const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const FileUploader = ({
  userId,
  isSignedIn,
  isSubscribed,
}: {
  userId: string | null;
  isSignedIn: boolean;
  isSubscribed: boolean;
}) => {
  const router = useRouter();

  const { open: openSignInModal } = useSignInModal();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const createFile = useMutation(api.files.createFile);
  const getFileUrl = useMutation(api.files.getFileUrl);

  const startProgressSimulation = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) =>
        prev >= 95 ? (clearInterval(interval), prev) : prev + 5
      );
    }, 500);
    return interval;
  };

  const onUpload = useCallback(
    async (acceptedFile: any) => {
      if (!userId) return;
      try {
        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": acceptedFile!.type },
          body: acceptedFile,
        });
        const { storageId } = await result.json();
        const fileUrl = await getFileUrl({ storageId });

        const fileId = await createFile({
          userId: userId,
          name: acceptedFile.name,
          storageId: storageId,
          url: fileUrl,
        });

        return fileId;
      } catch (error) {
        console.error("Upload failed:", error);
        return null;
      }
    },
    [generateUploadUrl, createFile, userId]
  );

  return (
    <div
      className="bg-white rounded-lg shadow-lg
     shadow-primary/10 
    p-4"
    >
      <Dropzone
        multiple={false}
        accept={{ "application/pdf": [".pdf"] }}
        maxSize={MAX_FILE_SIZE}
        onDropRejected={(rejectedFiles) => {
          if (rejectedFiles[0].file.size > MAX_FILE_SIZE) {
            toast.error("File size exceeds the 2MB limit");
          }
          toast.error("Only Resume PDF files are allowed");
        }}
        onDrop={async (acceptedFiles) => {
          setIsUploading(true);
          const progressInterval = startProgressSimulation();
          try {
            // handle file uploading
            const fileId = await onUpload(acceptedFiles[0]);

            if (!fileId) {
              toast.error("Something went wrong");
              return;
            }

            router.push(`/file/${fileId}`);
          } finally {
            clearInterval(progressInterval);
            setUploadProgress(100);
          }
        }}
      >
        {({ getRootProps, getInputProps, acceptedFiles }) => (
          <div
            {...getRootProps({
              onClick: (event) => {
                if (isUploading) {
                  event.stopPropagation();
                  return;
                }
                if (!isSignedIn) {
                  // Prevent the default behavior of opening the file dialog
                  event.stopPropagation(); // Stop the event from propagating
                  openSignInModal(); // Open the sign-in modal
                }
              },
            })}
            className="border h-64 m-4 border-dashed
             border-gray-300 rounded-lg"
          >
            <div
              className="flex items-center justify-center
             h-full w-full"
            >
              <label
                htmlFor="dropzone-file"
                className={cn(
                  `flex flex-col items-center justify-center
                  w-full h-full rounded-lg
                bg-primary/5 hover:bg-primary/10 cursor-pointer`,
                  isUploading && "!pointer-events-none"
                )}
              >
                {!isUploading && (
                  <div
                    className="flex flex-col items-center 
                  justify-center pt-5 pb-6"
                  >
                    <CloudUploadIcon
                      className="h-6 w-6 text-gray-500
                     mb-2"
                    />
                    <p className="mb-2 text-sm text-gray-700">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF (up to {isSubscribed ? "10" : "5"}MB)
                    </p>
                  </div>
                )}

                {acceptedFiles && acceptedFiles[0] ? (
                  <div
                    className="max-w-xs z-10 bg-white
                     flex items-center rounded-md 
                  overflow-hidden outline outline-[1px]
                   outline-gray-200 divide-x
                   divide-gray-200"
                  >
                    <div
                      className="px-3 py-2 h-full grid 
                    place-items-center"
                    >
                      <File className="h-4 w-4 text-primary" />
                    </div>
                    <div className="px-3 py-2 h-full text-sm truncate">
                      {acceptedFiles[0]?.name}
                    </div>
                  </div>
                ) : null}

                {isUploading ? (
                  <div className="w-full mt-4 max-w-xs mx-auto">
                    <Progress
                      value={uploadProgress}
                      className={cn(
                        `h-1 w-full bg-gray-200`,
                        uploadProgress === 100 ? "!bg-green-500" : ""
                      )}
                    />
                    <div
                      className="flex gap-1 items-center
                       justify-center text-sm 
                      text-gray-700 text-center pt-2"
                    >
                      <Loader className="h-3 w-3 animate-spin" />
                      {uploadProgress === 100
                        ? "Redirecting..."
                        : "Uploading..."}
                    </div>
                  </div>
                ) : null}

                <input {...getInputProps()} type="file" className="hidden" />
              </label>
            </div>
          </div>
        )}
      </Dropzone>
    </div>
  );
};

export default FileUploader;
