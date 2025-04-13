import AppHighlights from "./_components/_common/AppHighlights";
import JobInfoForm from "./_components/JobInfoForm";

export default function Home() {
  return (
    <div
      className="w-full flex-1 min-h-screen flex flex-col items-center
       bg-gradient-to-br from-purple-500/5 to-primary/5 "
    >
      <div className="space-y-3">
        <AppHighlights />

        <div className="text-center">
          <h1
            className="text-[56px] font-bold bg-gradient-to-r from-primary
           to-purple-600 bg-clip-text text-[#070D1B] tracking-[-0.8px]"
          >
            AI-Chat Interview
            <span className="relative inline-block pl-5">
              <div
                className="absolute -right-2.5 top-2 w-[145px] h-16 bg-primary
                 rotate-2 rounded-lg z-10"
              />
              <span className="relative text-white z-20">Prep</span>
            </span>
            <span className="block -mt-5">and Job Insights</span>
          </h1>
          <p className="text-lg text-gray-600 m-[10px_auto]">
            Join millions of{" "}
            <span className="relative inline-block">
              <span className="text-[#FB923C]">
                job seekers and professionals
              </span>
              <svg
                viewBox="0 0 336 10"
                className="absolute left-[1%] bottom-0 w-[97%] h-[7px]"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 8.90571C100.5 7.40571 306.7 5.305715 334 8.90571"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            to instantly
            <br />
            get job Insights and prepare for interviews with AI-powered tools.
          </p>
        </div>

        <JobInfoForm />

        <br />
      </div>
    </div>
  );
}
