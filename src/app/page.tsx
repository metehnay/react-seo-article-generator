"use client";
import React, { useState } from "react";
import axios from "axios";
import { styles } from "./styling";
import DOMPurify from "dompurify";
import "highlight.js/styles/github.css"; 
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

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

const Home: React.FC = () => {
  const md = new MarkdownIt({
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (_) {}
      }
      return ""; 
    },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [contentGenerated, setContentGenerated] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [contents, setContent] = useState<string>(
    "Write a prompt here to generate content."
  );
  const [title, setTitle] = useState<string>("Your Article Title Here");
  const [scheduleDateString, setScheduleDateString] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const generateRandomTime = () => {
    const randomHour = Math.floor(Math.random() * 24)
      .toString()
      .padStart(2, "0");
    const randomMinute = Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, "0");
    const randomSecond = Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, "0");
    return `${randomHour}:${randomMinute}:${randomSecond}`;
  };

  const searchUnsplash = async () => {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/search/photos",
        {
          params: {
            query: searchTerm,
            client_id: "SECRET KEY UNSPLASH",
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
    const apiKey = "YOUR OPENAI API  KEY";
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: contents,
            },
          ],
          max_tokens: 2000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const htmlContent = md.render(content);
      const sanitizedContent = DOMPurify.sanitize(htmlContent);

      setGeneratedContent(sanitizedContent);
      setContentGenerated(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareContentToWordPress = async () => {
    setLoading(true);
    const wordpressUrl = "https://yourwebsite.com";
    const username = "YOUR WP ADMIN USER";
    const password = "YOUR API PASSWORD";
    const auth = "Basic " + btoa(username + ":" + password);

    let imageId = null;
    if (selectedImage) {
      imageId = await uploadImageToWordPress();
    }

    const dateToSchedule = new Date(scheduleDateString);
    const randomTime = generateRandomTime();
    const scheduleDateTimeString = `${scheduleDateString}T${randomTime}`;
    dateToSchedule.setTime(
      dateToSchedule.getTime() +
        (new Date(scheduleDateTimeString).getTime() -
          new Date(scheduleDateString).getTime())
    );

    const scheduleDate = dateToSchedule.toISOString();

    try {
      await axios.post(
        `${wordpressUrl}/wp-json/wp/v2/posts`,
        {
          title: title,
          content: generatedContent,
          status: "future",
          date: scheduleDate,
          featured_media: imageId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
          },
        }
      );

      console.log("Content successfully scheduled on WordPress.");
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

    const wordpressUrl = "YOUR WEBSITE";
    const username = "USER";
    const password = "API PASSWORD";
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

      <label>Article Title:</label>
      <input
        style={styles.inputBoxTitle}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Article Content:</label>
      <textarea
        style={styles.inputBox}
        value={contents}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={generateContent} style={styles.button}>
        Generate Content
      </button>
      <label>Date to Publish:</label>
      <input
        type="date"
        value={scheduleDateString}
        onChange={(e) => setScheduleDateString(e.target.value)}
      />
      {imagePreviewUrl && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={imagePreviewUrl}
            alt="Selected Preview"
            style={{ width: "300px", borderRadius: "8px" }}
          />
        </div>
      )}
      <div style={styles.generatedContent}>
        <h2 style={styles.contentTitle}>Generated Content</h2>
        <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
      </div>
      {loading && <p>Sending...</p>}
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

export default Home;
