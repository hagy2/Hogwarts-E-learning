"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from "@/app/components/layout";
import { Progress,course } from "@/app/_lib/page";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

const userId = Cookies.get("userId");

export default function ProgressPage() {
  const { courseId } = useParams();
  const [course,setCourse]=useState<course|null>();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   

    
    const fetchOrCreateProgress = async () => {
      const response = await axiosInstance.get<course>(`/course/${courseId}`);
      setCourse(response.data);
      try {
        if (userId && courseId) {
          
          const response = await axiosInstance.get<Progress>(
            `/progress/user/${userId}/course/${courseId}`
          );
          setProgress(response.data);
        }
    }
    catch(error){
            console.error("error fetching progress",error)
        }

        if (!progress) {
            let c;
          try {
            // If not found, create the progress record
            const newP={
                user_id: userId,
              course_id: courseId,
              performanceMetric: "Beginner",
              last_accessed:'2024-12-06T00:00:00.000+00:00'
            }
            c=newP;
            
            const createResponse = await axiosInstance.post<Progress>("/progress", newP);      
            setProgress(createResponse.data);

          } catch (error) {
            console.log("c",c);
            console.error("Failed to create progress for the user and course.",error);
          }
       
        
      finally {
        setLoading(false);
      }
    };
  }

    fetchOrCreateProgress();
  }, [userId, courseId]);

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

  return (
    <Layout>
      <main className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl bg-[#202020] p-8 shadow-lg">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Progress</h1>

          <section className="text-gray-300">
           
            <p>
              <span className="font-semibold">completed:</span>{" "}
              {course?.completed}
            </p>
           
            <p>
              <span className="font-semibold">Average Score for the course :</span> {course?.Avg}
            </p>
           
          </section>
        </div>
      </main>
    </Layout>
  );
}
