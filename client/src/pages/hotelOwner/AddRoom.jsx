import React, { useState } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dom61gprg/image/upload';
const UPLOAD_PRESET = 'firstuses'; // Unsigned preset

const AddRoom = () => {
    const { axios, getToken } = useAppContext();

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: '',
        amenities: {
            'Free WiFi': false,
            'Free Breakfast': false,
            'Mountain View': false,
            'Pool Access': false
        }
    });

    const [loading, setLoading] = useState(false);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const res = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.secure_url) return data.secure_url;

            console.error('Cloudinary Upload Error:', data);
            throw new Error('Image upload failed');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!inputs.roomType || !inputs.pricePerNight || !Object.values(images).some(img => img)) {
            toast.error("Please fill in all the details");
            return;
        }

        setLoading(true);

        try {
            const uploadedImageUrls = [];

            for (const key of Object.keys(images)) {
                if (images[key]) {
                    const url = await uploadToCloudinary(images[key]);
                    uploadedImageUrls.push(url);
                }
            }

            const amenities = Object.keys(inputs.amenities).filter(key => inputs.amenities[key]);

            const formData = {
                roomType: inputs.roomType,
                pricePerNight: inputs.pricePerNight,
                amenities,
                images: uploadedImageUrls,
            };

            const res = await axios.post('/api/rooms/', formData, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });

            console.log("POST /api/rooms/ response:", res.data);

            const data = res?.data;

            if (data?.success) {
                toast.success(data.message || 'Room added successfully');

                // Reset form
                setInputs({
                    roomType: '',
                    pricePerNight: '',
                    amenities: {
                        'Free WiFi': false,
                        'Free Breakfast': false,
                        'Mountain View': false,
                        'Pool Access': false
                    }
                });
                setImages({ 1: null, 2: null, 3: null, 4: null });
            } else {
                toast.error(data?.message || 'Something went wrong');
            }
        } catch (err) {
            console.error("Submit Error:", err);
            toast.error(err.message || 'Error adding room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler}>
            <Title
                align="left"
                font="outfit"
                title="Add Room"
                subTitle="Fill in the details carefully and accurate room details, pricing, and amenities, to enhances the user booking experience."
            />

            <p className="text-gray-800 mt-10">Images</p>
            <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
                {Object.keys(images).map((key) => (
                    <label htmlFor={`roomImage${key}`} key={key}>
                        <img
                            className="max-h-32 w-auto cursor-pointer opacity-80 rounded"
                            src={
                                images[key]
                                    ? URL.createObjectURL(images[key])
                                    : assets.uploadArea
                            }
                            alt={`Room Image ${key}`}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            id={`roomImage${key}`}
                            hidden
                            onChange={e =>
                                setImages({ ...images, [key]: e.target.files[0] })
                            }
                        />
                    </label>
                ))}
            </div>

            <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
                <div className="flex-1 max-w-48">
                    <p className="text-gray-800 mt-4">Room Type</p>
                    <select
                        value={inputs.roomType}
                        onChange={e => setInputs({ ...inputs, roomType: e.target.value })}
                        className="border opacity-70 border-gray-300 mt-1 rounded p-2 w-full"
                    >
                        <option value="">Select Room Type</option>
                        <option value="Single Bed">Single Bed</option>
                        <option value="Double Bed">Double Bed</option>
                        <option value="Luxury Room">Luxury Room</option>
                        <option value="Family Suite">Family Suite</option>
                    </select>
                </div>

                <div>
                    <p className="mt-4 text-gray-800">
                        Price <span className="text-xs">/night</span>
                    </p>
                    <input
                        type="number"
                        placeholder="0"
                        className="border border-gray-300 mt-1 rounded p-2 w-24"
                        value={inputs.pricePerNight}
                        onChange={e => setInputs({ ...inputs, pricePerNight: e.target.value })}
                    />
                </div>
            </div>

            <p className="text-gray-800 mt-4">Amenities</p>
            <div className="flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm">
                {Object.keys(inputs.amenities).map((amenity, index) => (
                    <div key={index}>
                        <input
                            type="checkbox"
                            id={`amenities${index + 1}`}
                            checked={inputs.amenities[amenity]}
                            onChange={() =>
                                setInputs({
                                    ...inputs,
                                    amenities: {
                                        ...inputs.amenities,
                                        [amenity]: !inputs.amenities[amenity],
                                    },
                                })
                            }
                        />
                        <label htmlFor={`amenities${index + 1}`}> {amenity}</label>
                    </div>
                ))}
            </div>

            <button
                className="bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer"
                disabled={loading}
            >
                {loading ? 'Adding...' : 'Add Room'}
            </button>
        </form>
    );
};

export default AddRoom;
