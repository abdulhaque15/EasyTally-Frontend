import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Container } from "react-bootstrap";
import { FiEdit2 } from "react-icons/fi";
import { useForm } from "react-hook-form";
import uvCapitalApi from "../api/uvCapitalApi";
import toast, { Toaster } from 'react-hot-toast';
import { useAuthWrapper } from "../helper/AuthWrapper";
import { FaWindowClose } from "react-icons/fa";

const EditProfileModal = ({ show, onHide }) => {
  const { user, setUser } = useAuthWrapper();
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      phone: "",
      description: "",
      country: "",
      state: "",
      city: "",
      zip_code: "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
      setValue("mobile", user.mobile || "");
      setValue("phone", user.phone || "");
      setValue("description", user.description || "");
      setValue("country", user.country || "");
      setValue("state", user.state || "");
      setValue("city", user.city || "");
      setValue("zip_code", user.zip_code || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      let updatedUser = { ...user };
      let imageUpdated = false;
      let userUpdated = false;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const result = await uvCapitalApi.upsertProfile(formData);
        if (result.success && result?.data?.profile_path) {
          updatedUser.file_name = result.data.profile_path;
          setUser(updatedUser);
          imageUpdated = true;
        } else {
          toast.error(result.message);
          return;
        }
      }

      if (isDirty) {
        const result = await uvCapitalApi.updateUser(user.id, {
          ...updatedUser,
          ...data,
        });

        if (result.success) {
          updatedUser = { ...updatedUser, ...data };
          setUser(updatedUser);
          reset(updatedUser);
          userUpdated = true;
        } else {
          toast.error(result.message);
          return;
        }
      }

      if (imageUpdated || userUpdated) {
        toast.success("Profile updated successfully.");
      }

      onHide(); // Close modal after saving

    } catch (error) {
      console.error("Update failed", error);
      toast.error("Something went wrong while updating the user.");
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal show={show} onHide={onHide} size="xl" centered>
          <Modal.Header>
            <Modal.Title>Edit Profile</Modal.Title>
            <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
          </Modal.Header>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              <Container className="px-3 px-md-4 mt-2">
                {/* <div className="fs-4 heading-1">Edit Profile</div> */}
                <Row className="px-3 px-md-4 mt-2 pt-4">
                  <Col sm={3}>
                    <div className="details pt-4 position-relative text-center">
                      <img
                        id="output"
                        src={selectedFile ? URL.createObjectURL(selectedFile) : user?.file_name}
                        className="img-fluid img-responsive edit-profile-img"
                      />
                      <label
                        htmlFor="profileImageUpload"
                        className="edit-profile-label"
                      >
                        <FiEdit2 />
                      </label>
                      <input
                        type="file"
                        id="profileImageUpload"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(event) => {
                          const file = event?.target?.files[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                      />
                      <h4>{user?.name}</h4>
                    </div>
                  </Col>
                  <Col sm={9}>
                    <Row className="mb-3">
                      <Form.Group as={Col}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter name"
                          {...register("name")}
                        />
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          {...register("email")}
                        />
                      </Form.Group>
                    </Row>
                    <Row className="mb-3">
                      <Form.Group as={Col}>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter phone"
                          {...register("phone")}
                        />
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>Mobile</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter mobile"
                          {...register("mobile")}
                        />
                      </Form.Group>
                    </Row>
                    <Row className="mb-3">
                      <Form.Group as={Col}>
                        <Form.Label>Country</Form.Label>
                        <Form.Select {...register("country")}>
                          <option value="">Choose...</option>
                          <option value="India">India</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>State</Form.Label>
                        <Form.Select {...register("state")}>
                          <option value="">Choose...</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Delhi">Delhi</option>
                        </Form.Select>
                      </Form.Group>
                    </Row>
                    <Row className="mb-3">
                      <Form.Group as={Col}>
                        <Form.Label>City</Form.Label>
                        <Form.Select {...register("city")}>
                          <option value="">Choose...</option>
                          <option value="Jaipur">Jaipur</option>
                          <option value="Ajmer">Ajmer</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>Zip Code</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Zip"
                          {...register("zip_code")}
                        />
                      </Form.Group>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        placeholder="Enter description"
                        {...register("description")}
                      />
                    </Form.Group>

                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="model-btn-cancel rounded border-0 py-1"
                onClick={() => onHide()}
              >
                Cancel
              </button>
              <button
                className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
                type="submit"
                disabled={!isDirty && !selectedFile}
              >
                Save
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </Form>
    </>
  );
};

export default EditProfileModal;
