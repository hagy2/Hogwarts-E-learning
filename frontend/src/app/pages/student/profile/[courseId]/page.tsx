"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from "@/app/components/layout";
import { Progress } from "@/app/_lib/page";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const userId = Cookies.get("userId");

export default function ProgressPage() {
  const { courseId } = useParams();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("user",userId);
    const fetchOrCreateProgress = async () => {
      try {
        if (userId && courseId) {
          // Try to fetch progress
          const response = await axiosInstance.get<Progress>(
            `/progress/user/${userId}/course/${courseId}`
          );
          setProgress(response.data);
        }setLoading(false);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }

    
    };

    fetchOrCreateProgress();
  }, [userId, courseId]);

  const handleDownload = () => {
    if (progress) {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(progress, null, 2)
      )}`;
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `progress_${courseId}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (error) {
    return (
      <Layout>
        <main className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl bg-[#202020] p-8 shadow-lg">
            <p className="text-red-400">{error}</p>
          </div>
        </main>
      </Layout>
    );
  }

  const completionPercentage = progress?.completion_percentage || 0;
  const remainingPercentage = 100 - completionPercentage;

  const completionData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [completionPercentage, remainingPercentage],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(192, 75, 75, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(192, 75, 75, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Layout>
      <main className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl bg-[#202020] p-8 shadow-lg">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Progress</h1>

          {/* Completion Pie Chart */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Course Completion</h2>
            <Pie data={completionData} />
          </div>

          {/* Progress Details */}
          <section className="text-gray-300">
            <p>
              <span className="font-semibold">User ID:</span> {progress?.user_id}
            </p>
            <p>
              <span className="font-semibold">Course ID:</span> {progress?.course_id}
            </p>
            <p>
              <span className="font-semibold">Completion Percentage:</span> {completionPercentage}%
            </p>
            <p>
              <span className="font-semibold">Performance Metric:</span> {progress?.performanceMetric}
            </p>
            <p>
              <span className="font-semibold">Last Accessed:</span>{" "}
              {progress && new Date(progress.last_accessed).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Average Score:</span> {progress?.avgScore}
            </p>
            <p>
              <span className="font-semibold">Accessed Modules:</span>{" "}
              {progress?.accessed_modules.length > 0
                ? progress.accessed_modules.join(", ")
                : "No modules accessed yet."}
            </p>
          </section>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="mt-6 w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
          >
            Download Progress Data
          </button>
        </div>
      </main>
    </Layout>
  );
}
