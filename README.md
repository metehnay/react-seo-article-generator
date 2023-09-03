**With this simple app you can generate seo articles and send them to your wordpress site. You also don't need to find images, you can just use Unsplash API :)**

## Tech

- NextJs
- Wordpress API
- OpenAI API
- Unsplash API

## Installation

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

