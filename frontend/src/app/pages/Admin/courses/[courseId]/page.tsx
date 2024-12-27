"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from "../../../../utils/axiosInstance";
import Layout from "../../components/AL";
import { course, module } from "@/app/_lib/page";
import Cookies from "js-cookie";
import { ObjectId } from "mongoose";

interface Forum {
  _id: string;
  title: string;
  description: string;
  course: string;
  moderator: string;
}

interface User {
  _id: string;
  name: string;
}

interface chatrooms {
  _id: string;
  title: string;
  participants: string[];
  roomType: string;
  course: string;
  creator: string;
}


export default function CourseDetails() {
  const [course, setCourse] = useState<course | null>(null);
  const [bc, setbc] = useState<number>(0);
  const [forums, setForums] = useState<Forum[]>([]);
  const [moderatorNames, setModeratorNames] = useState<{ [key: string]: string }>({});
  const [chatRooms, setChatRooms] = useState<chatrooms[]>([]);
  const [newForumTitle, setNewForumTitle] = useState<string>("");
  const [newForumDescription, setNewForumDescription] = useState<string>("");
  const [newChatRoomTitle, setNewChatRoomTitle] = useState('');
  const [newChatRoomParticipants, setNewChatRoomParticipants] = useState<string[]>([]);
  const [newChatRoomType, setNewChatRoomType] = useState('');

  const userId = Cookies.get("userId");

  const router = useRouter();
  const { courseId } = useParams();
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showUpdateCourseModal, setShowUpdateCourseModal] = useState(false);
  const [courseName, setName] = useState<string>("");
  const [courseDescription, setDescription] = useState<string>("");
  const [courseDl, setDl] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [courseKeywords, setKeywords] = useState<string>("");
  const [isOutdated, setOutdated] = useState(false);
  const [modules, setModules] = useState<module[]>([]);
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [moduleContent, setModuleContent] = useState<string>('');
  const [moduleDifficulty, setModuleDifficulty] = useState<string>('Beginner');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [showUpdateModuleModal, setShowUpdateModuleModal] = useState(false);
  const[ShowAddResourceModal,setShowAddResourceModal] = useState(false);
const [currentModule, setCurrentModule] = useState<module | null>(null);



  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axiosInstance.get<course>(`/course/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course details", error);
      }
    };

    const fetchForums = async () => {
      try {
        const response = await axiosInstance.get<Forum[]>('/forums');
        const filteredForums = response.data.filter(forum => forum.course === courseId);
        setForums(filteredForums);

        // Fetch moderator names
        const moderatorNames = await Promise.all(
          filteredForums.map(async forum => {
            const moderatorResponse = await axiosInstance.get<User>(`/users/${forum.moderator}`);
            return { forumId: forum._id, name: moderatorResponse.data.name };
          })
        );

        const moderatorNamesMap = moderatorNames.reduce((acc, curr) => {
          acc[curr.forumId] = curr.name;
          return acc;
        }, {} as { [key: string]: string });

        setModeratorNames(moderatorNamesMap);
      } catch (error) {
        console.error("Error fetching forums", error);
      }
    }; const fetchModules = async () => {
        try {
          const response = await axiosInstance.get<module[]>(`/modules/course/${courseId}`);
          setModules(response.data);
        } catch (error) {
          console.error("Error fetching modules", error);
        }
      };
      
  

    const fetchChatRooms = async () => { // From chatrooms code
      try {
        const response = await axiosInstance.get<chatrooms[]>('/chat-rooms/all');
        const filteredChatRooms = response.data.filter(chatRoom => chatRoom.course === courseId);
        setChatRooms(filteredChatRooms);
      } catch (error) {
        console.error("Error fetching chat rooms", error);
      }
    };



    fetchCourseDetails();
    fetchForums();
    fetchChatRooms(); // Call fetchChatRooms
    fetchModules(); // Call fetchModules

  }, [courseId]);
const handleDeleteCourse = async () => {
    try {
      await axiosInstance.delete(`/course/${courseId}`);
      alert("Course deleted successfully.");
      router.push("/pages/instructor/courses");
    } catch (error) {
      console.error("Error deleting course", error);
      alert("Failed to delete course. Please try again later.");
    }
  };
  const handleDeleteModules = async (moduleId: string) => {
   
  
    const confirmDelete = window.confirm("Are you sure you want to delete this module?");
    if (!confirmDelete) return;
  
    try {
      await axiosInstance.delete(`/modules/${moduleId}`);
      alert("Module deleted successfully.");
      setModules((prevModules) => prevModules.filter((mod) => mod._id.toString() !== moduleId));
    } catch (error) {
      console.error("Error deleting module", error);
      alert("Failed to delete module. Please try again later.");
    }
  };
  

  const handleUpdateCourse = async () => {
    try {
      const updatedCourse = {
        title: courseName,
        description: courseDescription,
        category: category,
        difficultyLevel: courseDl,
        createdAt: course?.createdAt,
        isOutdated: isOutdated,
        keywords: courseKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0),
      };

      await axiosInstance.put(`/course/${course?._id}`, updatedCourse);
      alert("Course updated successfully.");
      setShowUpdateCourseModal(false);
    } catch (error) {
      console.error("Error updating course", error);
      alert("Failed to update course. Please try again later.");
    }
  };
  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/forums', {
        title: newForumTitle,
        description: newForumDescription,
        course: courseId,
      });
      setForums([...forums, response.data]);
      setNewForumTitle("");
      setNewForumDescription("");
    } catch (error) {
      console.error("Error creating forum", error);
    }
  };

  
  

  const handleForumDelete = async (forumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await axiosInstance.delete(`/forums/${forumId}`);
      if (response.status === 200) {
        const response = await axiosInstance.get<Forum[]>('/forums');
        const filteredForums = response.data.filter(forum => forum.course === courseId);
        setForums(filteredForums);
      }
    } catch (error) {
      console.error("Error deleting forum", error);
    }
  };

  const handleCreateChatRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const chatRoomDto = {
      title: newChatRoomTitle,
      participants: newChatRoomParticipants,
      roomType: newChatRoomType,
      course: courseId,
    };

    try {
      const response = await axiosInstance.post('/chat-rooms', chatRoomDto);
      console.log('Chat room created:', response.data);
      // Reset form fields
      setNewChatRoomTitle('');
      setNewChatRoomParticipants([]);
      setNewChatRoomType('');

    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const handleChatRoomDelete = async (forumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await axiosInstance.delete(`/chat-rooms/${forumId}`);
      if (response.status === 200) {
        const response = await axiosInstance.get<Forum[]>('/chat-rooms');
        const filteredForums = response.data.filter(forum => forum.course === courseId);
        setForums(filteredForums);
      }
    } catch (error) {
      console.error("Error deleting chatroom", error);
    }
  };

  if (!course) {
    return (
      <Layout>
        <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
          <p className="text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }
  //merge
  return (
    <Layout>
      <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
        <h1 className="text-3xl font-bold text-white mb-8">{course.title}</h1>

        {/* Course Details */}
        <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white mb-8">
          <p className="text-xl mb-4">{course.description}</p>
          <p className="text-gray-400 mb-4">Category: {course.category}</p>
          <p className="text-gray-400 mb-4">Difficulty Level: {course.difficultyLevel}</p>
          <p className="text-gray-400 mb-4">Rating: {course.averageRating}</p>
          <p className="text-gray-400 mb-4">BeginnerCount: {bc}</p>
          <p className="text-gray-400 mb-4">
            Created At: {new Date(course.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-400 mb-4">Is Outdated: {course.isOutdated ? 'Yes' : 'No'}</p>
           {/* Delete and Update Course Buttons */}
        <div className="flex gap-4 mt-6">
          

         
        </div>
    </div>
             {/* Modules Section */}
      <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white mb-8">
        <h2 className="text-2xl font-bold mb-6">Modules</h2>
        {modules.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4">
            {modules.map((module) => (
              <li
                key={module._id.toString()}
                className="bg-[#353535] px-4 py-3 rounded-md text-gray-200 cursor-pointer hover:bg-[#454545]"
                onClick={() =>
                  router.push(`/pages/instructor/courses/${courseId}/modules/${module._id}`)
                }
              >
                <p className="text-xs uppercase tracking-wide text-gray-400">Title</p>
                <p className="font-medium text-base">{module.title}</p>
                <p className="text-xs uppercase tracking-wide text-gray-400">Content</p>
                <p className="font-medium text-base">{module.content}</p>
                 {/* Delete Button */}
        <button
          onClick={(e) => handleDeleteModules(module._id.toString())}
          className="text-red-500 hover:underline mt-2"
        >
          Delete Module
        </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No modules available for this course.</p>
        )}
      </div>

        {/* Forums Section */}
        <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white mb-8"> {/* Added margin-bottom */}
          <h2 className="text-2xl font-bold mb-6">Forums</h2>
          <div className="flex gap-8">
            {/* Forum List */}
            <div className="w-2/3">
              {forums.length > 0 ? (
                <ul className="grid grid-cols-1 gap-4">
                  {forums.map((forum) => (
                    <li
                      key={forum._id}
                      className="bg-[#353535] px-4 py-3 rounded-md text-gray-200 cursor-pointer hover:bg-[#454545]"
                      onClick={() =>
                        router.push(`/pages/instructor/courses/${courseId}/${forum._id}`)
                      }
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-400">Title</p>
                      <p className="font-medium text-base">{forum.title}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Moderator
                      </p>
                      <p className="font-medium text-base">{moderatorNames[forum._id]}</p>

                     
                        <button
                          onClick={(e) => handleForumDelete(forum._id, e)}
                          className="text-red-500 hover:underline mt-2"
                        >
                          Delete Forum
                        </button>
                      

                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No forums available for this course.</p>
              )}
            </div>

            {/* Create New Forum Form */}
            <div className="w-1/3">
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Create New Forum</h3>
                <form onSubmit={handleCreateForum} className="grid gap-4">
                  <div>
                    <label htmlFor="newForumTitle" className="block text-gray-400">
                      Title
                    </label>
                    <input
                      type="text"
                      id="newForumTitle"
                      value={newForumTitle}
                      onChange={(e) => setNewForumTitle(e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newForumDescription" className="block text-gray-400">
                      Description
                    </label>
                    <textarea
                      id="newForumDescription"
                      value={newForumDescription}
                      onChange={(e) => setNewForumDescription(e.target.value)}
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

        {/* Chat Rooms Section */}
        <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-6">Chat Rooms</h2>
          <div className="flex gap-8">
            {/* Chat Room List */}
            <div className="w-2/3">
              {chatRooms.length > 0 ? (
                <ul className="grid grid-cols-1 gap-4">
                  {chatRooms.map((chatRoom) => (
                    <li
                      key={chatRoom._id}
                      className="bg-[#353535] px-4 py-3 rounded-md text-gray-200 cursor-pointer hover:bg-[#454545]"
                      onClick={() =>
                        router.push(`/pages/instructor/courses/${courseId}/chat/chat-${chatRoom._id}`)
                      }
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-400">Title</p>
                      <p className="font-medium text-base">{chatRoom.title}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Moderator
                      </p>
                      <p className="font-medium text-base">{chatRoom._id}</p>
                      <button
                        onClick={(e) => handleChatRoomDelete(chatRoom._id, e)}
                        className="text-red-500 hover:underline mt-2"
                      >
                        Delete Chat Room
                      </button>

                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No chat rooms available for this course.</p>
              )}
            </div>


            {/* Create New Chat Room Form */}
            <div className="w-1/3">
              <section>
                <h3 className="text-xl font-semibold text-white mb-4">Create New Chat Room</h3>
                <form onSubmit={handleCreateChatRoom} className="grid gap-4">
                  <div>
                    <label htmlFor="newChatRoomTitle" className="block text-gray-400">
                      Title
                    </label>
                    <input
                      type="text"
                      id="newChatRoomTitle"
                      value={newChatRoomTitle}
                      onChange={(e) => setNewChatRoomTitle(e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newChatRoomParticipants" className="block text-gray-400">
                      Participants
                    </label>
                    <input
                      type="text"
                      id="newChatRoomParticipants"
                      value={newChatRoomParticipants.join(',')}
                      onChange={(e) => setNewChatRoomParticipants(e.target.value.split(','))}
                      className="w-full p-2 rounded-md bg-gray-800 text-white"
                      placeholder="Enter participant IDs separated by commas"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newChatRoomType" className="block text-gray-400">
                      Room Type (optional)
                    </label>
                    <input
                      type="text"
                      id="newChatRoomType"
                      value={newChatRoomType}
                      onChange={(e) => setNewChatRoomType(e.target.value)}
                      className="w-full p-2 rounded-md bg-gray-800 text-white"
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