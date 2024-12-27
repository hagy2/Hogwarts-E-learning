"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from "../../../components/AL"
import Cookies from "js-cookie";

interface Forum {
    _id: string;
    title: string;
    description: string;
    course: string;
    moderator: string;
}

interface Thread {
    _id: string;
    title: string;
    content: string;
    forum: string;
    creator: string;

}

interface User {
    _id: string;
    name: string;
}

interface Course {
    _id: string;
    title: string;
}

export default function ForumDetails() {
    const [forum, setForum] = useState<Forum | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [moderatorName, setModeratorName] = useState<string>("");
    const [courseName, setCourseName] = useState<string>("");
    const router = useRouter();
    const { forumId, courseId } = useParams();
    const [newThreadTitle, setNewThreadTitle] = useState<string>("");
    const [newThreadContent, setNewThreadContent] = useState<string>("");
    const userId = Cookies.get("userId");


    useEffect(() => {
        const fetchForumDetails = async () => {
            try {
                const response = await axiosInstance.get<Forum>(`/forums/${forumId}`);
                setForum(response.data);

                // Fetch moderator name
                const moderatorResponse = await axiosInstance.get<User>(`/users/${response.data.moderator}`);
                setModeratorName(moderatorResponse.data.name);

                // Fetch course name
                const courseResponse = await axiosInstance.get<Course>(`/course/${response.data.course}`);
                setCourseName(courseResponse.data.title);
            } catch (error) {
                console.error("Error fetching forum details", error);
            }
        };

        const fetchThreads = async () => {
            try {
                const response = await axiosInstance.get<Thread[]>('/threads');
                const filteredThreads = response.data.filter(thread => thread.forum === forumId);
                setThreads(filteredThreads);
            } catch (error) {
                console.error("Error fetching threads", error);
            }
        };

        fetchForumDetails();
        fetchThreads();
    }, [forumId]);

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/threads', {
                title: newThreadTitle,
                content: newThreadContent,
                forum: forumId, // Use forumId from useParams
            });

            // Update the threads state to include the new thread
            setThreads([...threads, response.data]);

            // Clear the form fields
            setNewThreadTitle("");
            setNewThreadContent("");

            // Optionally, you can show a success message or perform other actions
        } catch (error) {
            console.error("Error creating thread", error);
            // Optionally, display an error message to the user
        }
    };

    const handleThreadDelete = async (threadId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the default behavior

        try {
            const response = await axiosInstance.delete(`/threads/${threadId}`);
            if (response.status === 200) {
                setThreads(threads.filter((thread) => thread._id !== threadId));
            }
        } catch (error) {
            console.error("Error deleting thread", error);
        }
    };


    if (!forum) {
        return (
            <Layout>
                <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
                    <p className="text-gray-400">forumss Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
                <h1 className="text-3xl font-bold text-white mb-8">{forum.title}</h1>
                <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white">
                    <p className="text-xl mb-4">Description: {forum.description}</p>
                    <p className="text-lg mb-4">Course: {courseName}</p>
                    <p className="text-lg mb-4">Moderator: {moderatorName}</p>
                </div>

                {/* Threads Section */}
                <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white mt-8">
                    <h2 className="text-2xl font-bold mb-4">Threads</h2>
                    <div className="flex gap-8">
                        {/* Threads List (2/3 width) */}
                        <div className="w-2/3">
                            {threads.length > 0 ? (
                                <ul className="grid grid-cols-1 gap-4">
                                    {threads.map((thread) => (
                                        <li
                                            key={thread._id}
                                            className="bg-[#353535] px-4 py-3 rounded-md text-gray-200 cursor-pointer hover:bg-[#454545]"
                                            onClick={() =>
                                                router.push(
                                                    `/pages/student/courses/${forum.course}/${forum._id}/${thread._id}`
                                                )
                                            }
                                        >
                                            <p className="text-xs uppercase tracking-wide text-gray-400">Title</p>
                                            <p className="font-medium text-base">{thread.title}</p>
                                                <button
                                                    onClick={(e) => handleThreadDelete(thread._id, e)}
                                                    className="text-red-500 hover:underline mt-2"
                                                >
                                                    Delete
                                                </button>
                                            
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400">No threads available for this forum.</p>
                            )}
                        </div>

                        {/* Create New Thread Form (1/3 width) */}
                        <div className="w-1/3">
                            <section>
                                <h3 className="text-xl font-semibold text-white mb-4">Create New Thread</h3>
                                <form onSubmit={handleCreateThread} className="grid gap-4">
                                    <div>
                                        <label htmlFor="newThreadTitle" className="block text-gray-400">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            id="newThreadTitle"
                                            value={newThreadTitle}
                                            onChange={(e) => setNewThreadTitle(e.target.value)}
                                            className="w-full p-2 rounded-md bg-gray-800 text-white"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}