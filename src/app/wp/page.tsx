"use client"
import React, { useState } from "react";
import axios from "axios";
import { styles } from "./styling";

interface SearchResult {
  id: string;
  description: string;
  urls: {
    small: string;
    full: string;
  };
  width: number;
  height: number;
}

const ContentGenerator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [topicTitle, setTopicTitle] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [contentGenerated, setContentGenerated] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const searchUnsplash = async () => {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/search/photos",
        {
          params: {
            query: searchTerm,
            client_id: "YOUR_UNSPLASH_CLIENT_ID",
          },
        }
      );
      const horizontalResults = response.data.results.filter(
        (result: SearchResult) => result.width > result.height
      );
      setSearchResults(horizontalResults);
    } catch (error) {
      console.error("Error searching Unsplash:", error);
    }
  };

  const selectImage = async (url: string) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });

      const imageBlob = new Blob([response.data], { type: "image/jpeg" });
      const imageFile = new File([imageBlob], "unsplash-image.jpg", {
        type: "image/jpeg",
      });
      setSelectedImage(imageFile);
      setImagePreviewUrl(URL.createObjectURL(imageFile));
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const generateContent = async () => {
    setLoading(true);
    const apiKey = "YOUR_OPENAI_API_KEY";
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: topicTitle }],
          max_tokens: 700,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const content = response.data.choices[0].message.content;
      setGeneratedContent(content);
      setContentGenerated(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareContentToWordPress = async () => {
    setLoading(true);
    const wordpressUrl = "YOUR_WORDPRESS_URL";
    const username = "YOUR_WORDPRESS_USERNAME";
    const password = "YOUR_WORDPRESS_PASSWORD";
    const auth = "Basic " + btoa(username + ":" + password);

    let imageId = null;
    if (selectedImage) {
      imageId = await uploadImageToWordPress();
    }

    try {
      await axios.post(
        `${wordpressUrl}/wp-json/wp/v2/posts`,
        {
          title: topicTitle,
          content: generatedContent,
          status: "publish",
          featured_media: imageId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
          },
        }
      );

      console.log("Content successfully posted to WordPress.");
    } catch (error) {
      console.error("Error posting to WordPress:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToWordPress = async () => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append("file", selectedImage);

    const wordpressUrl = "YOUR_WORDPRESS_URL";
    const username = "YOUR_WORDPRESS_USERNAME";
    const password = "YOUR_WORDPRESS_PASSWORD";
    const auth = "Basic " + btoa(username + ":" + password);

    try {
      const response = await axios.post(
        `${wordpressUrl}/wp-json/wp/v2/media`,
        formData,
        {
          headers: {
            "Content-Disposition": `attachment; filename="${selectedImage.name}"`,
            Authorization: auth,
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SEO Content Generator</h1>
      <label style={styles.label}>Topic Title</label>
      <textarea
        style={styles.inputBox}
        value={topicTitle}
        onChange={(e) => setTopicTitle(e.target.value)}
      />
      <button onClick={generateContent} style={styles.button}>
        Generate Content
      </button>
      {imagePreviewUrl && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={imagePreviewUrl}
            alt="Selected Preview"
            style={{ width: "300px", borderRadius: "8px" }}
          />
        </div>
      )}
      {generatedContent && (
        <div style={styles.generatedContent}>
          <h2 style={styles.contentTitle}>Generated Content</h2>
          <p>{generatedContent}</p>
        </div>
      )}
      <button onClick={shareContentToWordPress} style={styles.button}>
        Share Content to WordPress
      </button>
      <label>Select or Search for an Image:</label>
      <input type="file" onChange={handleImageChange} />
      <input
        type="text"
        placeholder="Search on Unsplash..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={searchUnsplash}>Search</button>
      <div>
        {searchResults.map((result) => (
          <img
            key={result.id}
            src={result.urls.small}
            onClick={() => selectImage(result.urls.full)}
            alt={result.description}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentGenerator;
