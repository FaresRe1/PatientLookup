"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddClientPage() {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent, startNewVisit: boolean = false) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('gender', gender);
      formData.append('dob', dob);
      if (email) formData.append('email', email);
      if (phoneNumber) formData.append('phoneNumber', phoneNumber);
      if (address) formData.append('address', address);
      if (profileImage) formData.append('profileImage', profileImage);

      const response = await fetch("/api/clients", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add client.");
      }

      const responseData = await response.json();
      const newClientId = responseData.newClient.id;

      setSuccess("Client added successfully!");
      setFullName("");
      setGender("")
      setDob("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");
      setProfileImage(null);

      if (startNewVisit) {
        router.push(`/clients/${newClientId}/new-visit`);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div>
      <h1>Add New Patient</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <div>
          <label htmlFor="fullName">Full Name (Required):</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="gender">Gender (Required):</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            style={{ padding: '5px', margin: '5px 0' }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="dob">Date of Birth (Required):</label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="profileImage">Profile Image (Optional, max 5MB):</label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file && file.size > 5 * 1024 * 1024) {
                alert("Profile image must be smaller than 5MB");
                e.target.value = "";
                setProfileImage(null);
              } else {
                setProfileImage(file);
              }
            }}
          />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit">Add Patient</button>
          <button type="button" onClick={(e) => handleSubmit(e, true)} style={{ backgroundColor: '#059669', color: 'white' }}>
            Add Patient and Start New Visit
          </button>
        </div>
      </form>
      <br />
      <button>
        <Link href="/">Back to Patient List</Link>
      </button>
    </div> 
  );
}
