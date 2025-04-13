// "use client";
// import { useEffect, useState } from "react";
// import { useSidebar } from "@/components/ui/sidebar";
// import { cn } from "@/lib/utils";
// import { useQuery } from "convex/react";
// import { AlertCircle, Loader } from "lucide-react";
// import { Id } from "@/convex/_generated/dataModel";
// import { api } from "@/convex/_generated/api";
// import { useAppContext } from "@/context/AppProvider";
// import { FileStatus, FileStatusType } from "@/lib/constant";
// import { PortfolioPreviewHeader } from "./_common/PortfolioPreviewHeader";

// const PortfolioPreview = (props: { fileId: Id<"files"> }) => {
//   const { fileId } = props;
//   const { setIsPortfolioGenerating, setFileStatus } = useAppContext();

//   const { open, isMobile } = useSidebar();
//   const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

//   const data = useQuery(api.files.getFileStatusAndPortfolio, {
//     fileId: fileId,
//   });

//   console.log(data, "data");

//   useEffect(() => {
//     if (data === undefined) setIsPortfolioGenerating(true);
//     if (data) setFileStatus(data.data?.status as FileStatusType);
//   }, [data, setFileStatus, setIsPortfolioGenerating]);

//   if (data === undefined) {
//     return (
//       <div className="w-full min-h-screen bg-gray-50">
//         <PortfolioPreviewHeader
//           open={open}
//           isMobile={isMobile}
//           viewMode={viewMode}
//           setViewMode={setViewMode}
//         />
//         <div className="flex flex-1 items-center justify-center h-[65vh]">
//           <Loader className="w-6 h-6 animate-spin" />
//           <p className="text-zinc-500 text-sm">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen bg-gray-50">
//       {/* Browser-like header */}
//       <PortfolioPreviewHeader
//         open={open}
//         isMobile={isMobile}
//         viewMode={viewMode}
//         setViewMode={setViewMode}
//       />

//       {data?.success === false && (
//         <div
//           className="h-full max-w-80 mx-auto p-3 flex
//         items-center justify-center border border-red-500
//         rounded-sm"
//         >
//           <p className="text-red-500 text-sm">An unexpected error occurred</p>
//         </div>
//       )}

//       {data?.data?.status === FileStatus.PROCESSING && (
//         <div
//           className="flex flex-1 flex-col
//         items-center justify-center h-[65vh]"
//         >
//           <Loader className="w-6 h-6 animate-spin" />
//           <h3 className="font-semibold text-xl">Loading...</h3>
//           <p className="text-gray-500 text-sm">
//             We&apos;re Generating your Portfolio.
//           </p>
//         </div>
//       )}

//       {/* Portfolio container with responsive sizing */}
//       {data?.data?.status === FileStatus.READY && (
//         <div
//           className={cn(
//             `w-full`,
//             viewMode === "mobile" &&
//               "max-w-[375px] mx-auto border rounded-lg shadow-lg"
//           )}
//         >
//           <div className={viewMode === "mobile" ? "p-4" : ""}></div>
//         </div>
//       )}

//       {data?.data?.status === FileStatus.FAILED && (
//         <div className="flex flex-col items-center justify-center h-[65vh]">
//           <p className="mt-4 text-sm text-red-600">
//             Portfolio generation failed. Please try again.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PortfolioPreview;
