Just a simple React app i did it for my wordpress site. Feel free to use. 

## Features
- Results will be converted into HTML; you don't need to edit the content.
- Write your prompt and add posts to your WordPress site with one click.
- With the Unsplash API, you don't need to find and upload images.
- You can schedule posts; time will be random, so this won't flag your blog as spam.


![Alt Text](https://i.imgur.com/0aFQFp4.png)


## Installation

Clone this repo and run ```npm i``` then ```npm run dev```. visit ```localhost:3000``` in your localhost. 

Note: You can find all logic in ```src/app > App.tsx``` 

first of all add this line to your wp-config file.
```define('WP_APPLICATION_PASSWORDS', true);```

go to your user profile in wordpress. scroll down to find the application passwords section. create a password. now you can use the password in here

```
 const shareContentToWordPress = async () => {
    setLoading(true);
    const wordpressUrl = "YOUR_WORDPRESS_URL";
    const username = "YOUR_WORDPRESS_USERNAME";
    const password = "YOUR_WORDPRESS_PASSWORD";
    const auth = "Basic " + btoa(username + ":" + password);
 ```

Use your Unsplash API key in client_id

```
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
```

Replace apiKey with your openAI api key. 

```
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
```

That's it simple and easy to use =) 

