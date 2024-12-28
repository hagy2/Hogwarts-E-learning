"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from "@/app/components/layout";
import { Progress, course } from "@/app/_lib/page";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const userId = Cookies.get("userId");

export default function ProgressPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<course | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const response = await axiosInstance.get(`/course/${courseId}`);
        setCourse(response.data);
        setProgress(response.data.progress);
      } catch (err: any) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (userId && courseId) {
      fetchCourseData();
    }
  }, [userId, courseId]);

  const downloadCSV = () => {
    if (!course) return;

    const csvData = [
      ["Course Title", "Completed", "Average Score","beginner count","intermideate count","advanced count"],
      [course.title, course.completed, course.Avg,course.BeginnerCount,course.IntermediateCount,course.AdvancedCount],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${course.title}_progress.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  const chartData = {
    labels: ["Completed", "Average Score"],
    datasets: [
      {
        label: "Course Progress",
        data: [course?.completed || 0, course?.Avg || 0],
        backgroundColor: ["#4caf50", "#2196f3"],
      },
    ],
  };

  return (
    <Layout>
      <main className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl bg-[#202020] p-8 shadow-lg">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Progress</h1>

          <section className="text-gray-300 mb-6">
            <p>
              <span className="font-semibold">Course Title:</span> {course?.title}
            </p>
            <p>
              <span className="font-semibold">Completed:</span> {course?.completed}
            </p>
            <p>
              <span className="font-semibold">Average Score:</span> {course?.Avg}
            </p>
            <p>
              <span className="font-semibold">Avg rating:</span> {course?.averageRating}
            </p>
            <p>
              <span className="font-semibold">BeginnerCount:</span> {course?.BeginnerCount}
            </p>
            <p>
              <span className="font-semibold">IntermidieatCount:</span> {course?.IntermediateCount}
            </p>
            <p>
              <span className="font-semibold">Advanced Count:</span> {course?.AdvancedCount}
            </p>
          </section>

          <div className="mb-6">
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <button
            onClick={downloadCSV}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Download CSV
          </button>
        </div>
      </main>
    </Layout>
  );
}
