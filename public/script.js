const login = async () => {
    const url = "https://dera-api-jqko.onrender.com/api/v1/auth/login";

    const data = {
        email: "john.doe@example.com",
        password: "password"
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log("Response:", result);

    } catch (error) {
        console.error("Error:", error);
    }
};

login();
