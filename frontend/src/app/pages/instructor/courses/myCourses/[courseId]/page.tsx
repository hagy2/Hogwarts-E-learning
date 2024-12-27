"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from "../../../components/layout";
import { course } from "@/app/_lib/page";
import { ObjectId } from "mongoose";
import { module } from "@/app/_lib/page";
import Link from "next/link";
import axios from 'axios';

export default function CourseDetails() {
  const [course, setCourse] = useState<course | null>(null);
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
        setName(response.data.title);
        setDescription(response.data.description);
        setDl(response.data.difficultyLevel);
        setCategory(response.data.category);
        setKeywords(response.data.keywords.join(", "));
        setOutdated(response.data.isOutdated);
      } catch (error) {
        console.error("Error fetching course details", error);
      }
    };

    const fetchModules = async () => {
      try {
        const response = await axiosInstance.get<module[]>(`/modules/course/${courseId}`);
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules", error);
      }
    };

    fetchCourseDetails();
    fetchModules();
  }, [courseId]);

  const handleDeleteCourse = async (courseId: ObjectId) => {
    try {
      await axiosInstance.delete(`/course/${courseId}`);
      alert("Course deleted successfully.");
      router.push("/pages/instructor/courses");
    } catch (error) {
      console.error("Error deleting course", error);
      alert("Failed to delete course. Please try again later.");
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('hi',event.target.files)
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
    }
};

const handleUpload = async () => {
    if (!selectedFile) {
        setUploadStatus('Please select a file first.');
        return;
    }

    const formData = new FormData();
    console.log(selectedFile)
    formData.append('file', selectedFile);

    try {
        const response = await axios.post('http://localhost:3001/modules/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setUploadStatus('File uploaded successfully!');
       setUploadedFilePath(response.data);
        console.log('Response:', response);
        alert("Resource added successfully!");
        setSelectedFile(null);
        setShowAddResourceModal(false);
    } catch (error) {
        setUploadStatus('Error uploading file. Please try again.');
        console.error('Error:', error);
        
    }
};

  const handleAddModule = async () => {
  // const uf =await handleUpload();
  // setUploadedFilePath (uf);
  //console.log("uf",uploadedFilePath);

    

    try {
        const newModule = {
            courseId: course?._id,
            title: moduleTitle,
            content: moduleContent,
            resources: [uploadedFilePath],
            difficulty: moduleDifficulty,
           // questionBank_id:"675578978d525676a5c25f4e"
        };

        const response = await axiosInstance.post('/modules', newModule);
        setModules((prev) => [...prev, response.data]);
        setShowAddModuleModal(false);
        setModuleTitle('');
        setModuleContent('');
        setModuleDifficulty('Beginner');
        setSelectedFile(null);
        setUploadStatus('');
        alert('Module added successfully!');
    } catch (error) {
        console.error('Error adding module:', error);
        alert('Failed to add module. Please try again.');
    }
};  
const handleUpdateModule = async () => {
  if (!currentModule) return;

  try {
    const updatedModule = {
      title: currentModule.title,
      content: currentModule.content,
      resources: currentModule.resources,
      difficulty: currentModule.difficulty,
    };

    await axiosInstance.put(`/modules/${currentModule._id}`, updatedModule);
    setModules((prev) =>
      prev.map((mod) => (mod._id === currentModule._id ? { ...mod, ...updatedModule } : mod))
    );
    alert("Module updated successfully.");
    setShowUpdateModuleModal(false);
  } catch (error) {
    console.error("Error updating module:", error);
    alert("Failed to update module. Please try again.");
  }
};
const handleDeleteModules = async (moduleId: string) => {
  if (!moduleId) {
    alert("Invalid module ID.");
    return;
  }

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
// const handleAddResource = async (moduleId: string) => {
//   if (!selectedFile) {
//     alert("Please select a file to upload.");
//     return;
//   }

//   const formData = new FormData();
//   formData.append('file', selectedFile);

//   try {
//     const response = await axios.post('http://localhost:3001/modules/upload/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     const uploadedFilePath = response.data; // Assume this contains the uploaded file URL or path
//     await axiosInstance.put(`/modules/${moduleId}/add-resource`, { resource: uploadedFilePath });

//     setModules((prevModules) =>
//       prevModules.map((mod) =>
//         mod._id === moduleId
//           ? { ...mod, resources: [...mod.resources, uploadedFilePath] }
//           : mod
//       )
//     );

//     alert("Resource added successfully!");
//     setSelectedFile(null);
//     setShowAddResourceModal(false);
//   } catch (error) {
//     console.error("Error adding resource:", error);
//     alert("Failed to add resource. Please try again.");
//   }
// };

  if (!course) {
    return (
      <Layout>
        <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
          <p className="text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
        <h1 className="text-3xl font-bold text-white mb-8">{course.title}</h1>
        <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white">
          <p className="text-xl mb-4">{course.description}</p>
          <p className="text-gray-400 mb-4">Category: {course.category}</p>
          <p className="text-gray-400 mb-4">Difficulty Level: {course.difficultyLevel}</p>
          <p className="text-gray-400 mb-4">Rating: {course.averageRating}</p>
          <p className="text-gray-400 mb-4">Created At: {new Date(course.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-400 mb-4">Is Outdated: {course.isOutdated ? 'Yes' : 'No'}</p>
          <div className="flex justify-between items-center mt-4">
          <button
        onClick={() => setShowUpdateCourseModal(true)}
        className="text-blue-500 hover:text-blue-700"
      >
        Update Course Info
      </button>
            <button
              onClick={() => handleDeleteCourse(course._id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
            
          </div>
        </div>

        <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white">
                    <h2 className="text-2xl font-bold mb-4">Modules</h2>
                    {modules.length > 0 ? (
                        <ul className="space-y-4">
                            {modules.map((mod) => (
                                <li key={mod._id.toString()} className="border-b border-gray-700 pb-4">
                                    <h3 className="text-xl font-semibold">{mod.title}</h3>
                                    <p className="text-gray-400">{mod.content}</p>
                                    <div className="mt-2">
            <h4 className="text-lg font-semibold text-gray-400">Resources:</h4>
            {mod.resources?.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {mod.resources.map((resource, index) => (
                  <li key={index}>
                    <a
                      href={resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                      download
                    >
                      Download File {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No resources available for download.</p>
            )}
          </div>
          <button
      onClick={() => {
        setCurrentModule(mod);
        setShowAddResourceModal(true);
      }}
      className="text-blue-500 hover:text-blue-700 mt-2"
    >
      Upload Resource
    </button>

           {ShowAddResourceModal && currentModule && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Add Resource</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpload(currentModule._id);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-gray-400 mb-2">Select File</label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
            required
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
        <button
          onClick={() => setShowAddResourceModal(false)}
          className="text-red-500 hover:text-red-700 mt-4"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
)} <button
                                        onClick={() => router.push(`${courseId}/quiz?moduleId=${mod._id}`)}
      className="text-blue-500 hover:text-blue-700 mt-2"
    >  View Quiz
    </button> <button
              onClick={() => handleDeleteModules(mod._id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete Module
            </button>
            <button
  onClick={() => {
    setCurrentModule(mod);
    setShowUpdateModuleModal(true);
  }}
  className="text-blue-500 hover:text-blue-700 mt-2"
>
  Update Module
</button>
            
                  <p className="text-gray-400">Ratings {mod.averageRating}</p>
                                </li>
                                
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No modules available.</p>
                    )}
                    <button
                        onClick={() => setShowAddModuleModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                    >
                        Add Module
                    </button>
                </div>

                {showAddModuleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-4">Add Module</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddModule();
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-gray-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={moduleTitle}
                                        onChange={(e) => setModuleTitle(e.target.value)}
                                        required
                                        className="w-full p-2 rounded bg-gray-800 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Content</label>
                                    <textarea
                                        value={moduleContent}
                                        onChange={(e) => setModuleContent(e.target.value)}
                                        required
                                        className="w-full p-2 rounded bg-gray-800 text-white"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Difficulty</label>
                                    <select
                                        value={moduleDifficulty}
                                        onChange={(e) => setModuleDifficulty(e.target.value)}
                                        className="w-full p-2 rounded bg-gray-800 text-white"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Upload Resource</label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Add Module
                                </button>
                                {uploadStatus && <p className="text-yellow-400 mt-2">{uploadStatus}</p>}
                            </form>
                        </div>
                    </div>
                    
                )}
                {showUpdateModuleModal && currentModule && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Update Module</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateModule();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-gray-400 mb-2">Title</label>
          <input
            type="text"
            value={currentModule.title}
            onChange={(e) =>
              setCurrentModule({ ...currentModule, title: e.target.value })
            }
            required
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Content</label>
          <textarea
            value={currentModule.content}
            onChange={(e) =>
              setCurrentModule({ ...currentModule, content: e.target.value })
            }
            required
            className="w-full p-2 rounded bg-gray-800 text-white"
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Difficulty</label>
          <select
            value={currentModule.difficulty}
            onChange={(e) =>
              setCurrentModule({ ...currentModule, difficulty: e.target.value })
            }
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Update Module
        </button>
        <button
          onClick={() => setShowUpdateModuleModal(false)}
          className="text-red-500 hover:text-red-700 mt-4"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
)}
                {showUpdateCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Update Course</h2>
              <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateCourse();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-gray-400 mb-2">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Description</label>
            <textarea
              value={courseDescription}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-800 text-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Difficulty</label>
            <select
              value={courseDl}
              onChange={(e) => setDl(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
                  <label className="block text-gray-400 mb-2">Upload Resources</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="w-full p-2 rounded bg-gray-800 text-white"
                  />
                </div>
          <div>
            <label className="block text-gray-400 mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Keywords</label>
            <input
              type="text"
              value={courseKeywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Update Course
          </button>
        </form>
      </div>
    </div>
        )}
            </div>
    </Layout>
  );
}
