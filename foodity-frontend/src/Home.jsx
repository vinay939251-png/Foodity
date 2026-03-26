import React, { useEffect, useState } from "react";
import api from "./api";

function Home() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    api
      .get("recipes/")
      .then((response) => setRecipes(response.data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Latest Recipes 🥗</h1>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
