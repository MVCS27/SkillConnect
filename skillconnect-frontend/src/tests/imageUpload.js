import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config/api";

function ImageUpload() {
    const [image, setImage] = useState(null);
    const [allImage, setAllImage] = useState(null);

    useEffect(() => {
        getImage();
    }, []);

    const submitImage = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("image", image);

        await axios.post(`${API_BASE_URL}/upload-image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        getImage();
    };

    const onInputChange = (e) => {
        setImage(e.target.files[0])
    }

    const getImage = async () => {
        const result = await axios.get(`${API_BASE_URL}/get-images`);
        setAllImage(result.data.data);
    };
   
    return (
        <div className='auth-wrapper'>
            <div className='auth-inner' style={{ width: "auto" }}>
                <form onSubmit={submitImage}>
                    <label>Insert image</label><br />
                    <input
                        accept='image/*'
                        type='file'
                        onChange={onInputChange}
                    />
                    <button>Upload</button>
                </form>
                {allImage && allImage.map((data, index) => (
                   <img 
                        key={index} 
                        src={`${API_BASE_URL}/images/${data.image}`}
                        alt="uploaded"
                        height={100}
                        width={100}
                    />
                ))}
            </div>
        </div>
    );
}

export default ImageUpload;
