import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

        await axios.post("http://localhost:5001/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        getImage(); // reload images after upload ✅
    };


    const onInputChange = (e) => {
        console.log(e.target.files[0]);
        setImage(e.target.files[0])
    }

    const getImage = async () => {
        const result = await axios.get("http://localhost:5001/get-images");
        console.log(result);
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
                    src={`http://localhost:5001/images/${data.image}`}
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
