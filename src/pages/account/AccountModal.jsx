import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import toast from "react-hot-toast";
import uvCapitalApi from "../../api/uvCapitalApi";
import ccsj from "countrycitystatejson";

const AccountModal = ({
  show,
  onHide,
  rowData = {},
  setRefreshTable,
  onAccountCreated,
}) => {
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    if (show) {
      reset({
        id: rowData?.id || "",
        type: rowData?.type || "",
        name: rowData?.name || "",
        organization_name: rowData?.organization_name || "",
        gst_details: rowData?.gst_details || "",
        cin_no: rowData?.cin_no || "",
        currency: rowData?.currency || "",
        website: rowData?.website || "",
        email: rowData?.email || "",
        phone: rowData?.phone || "",
        fax: rowData?.fax || "",
        block: rowData?.block || "",
        street: rowData?.street || "",
        landmark: rowData?.landmark || "",
        area: rowData?.area || "",
        zip_code: rowData?.zip_code || "",
        city: rowData?.city || "",
        state: rowData?.state || "",
        country: rowData?.country || "",
        description: rowData?.description || "",
      });

      const all = ccsj.getCountries();
      if (rowData?.country) {
        const match = all.find((c) => c.name === rowData.country);
        if (match) {
          setSelectedCountry(match.shortName);
          setValue("country", match.name, { shouldDirty: false });

          const statesObj = ccsj.getStatesByShort(match.shortName);
          const stateArray = statesObj
            ? Object.keys(statesObj).map((k) => ({
                shortName: k,
                name: statesObj[k],
              }))
            : [];
          setStateList(stateArray);

          if (rowData?.state) {
            setSelectedState(rowData.state);
            setValue("state", rowData.state, { shouldDirty: false });

            const cities = ccsj.getCities(match.shortName, rowData.state) || [];
            setCityList(cities);
            setSelectedCity(rowData.city || "");
            setValue("city", rowData.city || "", { shouldDirty: false });
          }
        }
      } else {
        setSelectedCountry("");
        setValue("country", "", { shouldDirty: false });
        setStateList([]);
        setCityList([]);
        setSelectedState("");
        setSelectedCity("");
      }
    }
  }, [show]);

  useEffect(() => {
    const countries = ccsj.getCountries();
    setCountryList(countries);
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);

    const all = ccsj.getCountries();
    const picked = all.find((c) => c.shortName === countryCode);

    setValue("country", picked ? picked.name : "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setSelectedState("");
    setSelectedCity("");
    setCityList([]);

    const statesObj = ccsj.getStatesByShort(countryCode);
    const stateArray = statesObj
      ? Object.keys(statesObj).map((k) => ({
          shortName: k,
          name: statesObj[k],
        }))
      : [];
    setStateList(stateArray);
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setSelectedState(stateName);
    setValue("state", stateName, { shouldDirty: true });

    const cities = ccsj.getCities(selectedCountry, stateName) || [];
    setCityList(cities);
    setSelectedCity("");
    setValue("city", "", { shouldDirty: true });
  };

  const onSubmit = async (formData) => {
    const allCountries = ccsj.getCountries();
    const selected = allCountries.find((c) => c.shortName === selectedCountry);
    const payload = {
      ...formData,
      country: selected ? selected?.name : "",
    };

    try {
      let response;
      if (rowData?.id) {
        response = await uvCapitalApi.updateAccount(rowData.id, payload);
        toast.success(response?.message);
        setRefreshTable(true);
      } else {
        response = await uvCapitalApi.createAccount(payload);
        toast.success(response?.message);
        if (response?.success && onAccountCreated) {
          onAccountCreated(response?.data[0]);
        }
      }
      onHide();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Something went wrong while saving the company.");
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      scrollable
    >
      <Modal.Header>
        <Modal.Title className="detail-h1">
          {rowData?.id ? "Edit Company" : "Add New Company"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
      </Modal.Header>

      <Modal.Body className="detail-h3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div
            style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
          >
            <Row
              lg={12}
              sm={12}
              xs={12}
              className="ps-3 py-2 mb-3 section-header"
            >
              INFORMATION
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Name</span>
                  {errors.name && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.name.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Name"
                  size="sm"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  isInvalid={!!errors.name}
                />
              </Col>
              <Col>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  defaultValue={rowData?.type || ""}
                  size="sm"
                  {...register("type")}
                >
                  <option value="">Select Type</option>
                  <option value="Client">Client</option>
                  <option value="Partner">Partner</option>
                  <option value="Vendor">Vendor</option>
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Organization Name</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.organization_name || ""}
                  placeholder="Enter Organization Name"
                  size="sm"
                  {...register("organization_name")}
                />
              </Col>
              <Col>
                <Form.Label>GST Details</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.gst_details || ""}
                  placeholder="Enter GST Details"
                  size="sm"
                  {...register("gst_details")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>CIN No.</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.cin_no || ""}
                  placeholder="Enter CIN No."
                  size="sm"
                  {...register("cin_no")}
                />
              </Col>
              <Col>
                <Form.Label>Currency</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.currency || ""}
                  placeholder="Enter currency"
                  size="sm"
                  {...register("currency")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  defaultValue={rowData?.email || ""}
                  placeholder="Enter Email"
                  size="sm"
                  {...register("email")}
                />
              </Col>
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Phone</span>
                  {errors.phone && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.phone.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.phone || ""}
                  placeholder="Enter Phone"
                  size="sm"
                  isInvalid={!!errors.phone}
                  {...register("phone", {
                    min: {
                      value: 1000000000,
                      message: "Phone must be exactly 10 digits",
                    },
                    max: {
                      value: 9999999999,
                      message: "Phone must be exactly 10 digits",
                    },
                  })}
                  onInput={(e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  }}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.website || ""}
                  placeholder="Enter Website"
                  size="sm"
                  {...register("website")}
                />
              </Col>
              <Col>
                <Form.Label>Fax</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.fax || ""}
                  placeholder="Enter Fax"
                  size="sm"
                  {...register("fax")}
                />
              </Col>
            </Row>
            <Row
              lg={12}
              sm={12}
              xs={12}
              className="ps-3 py-2 mb-3 section-header"
            >
              ADDRESS INFORMATION
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Block</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.block || ""}
                  placeholder="Enter Block"
                  size="sm"
                  {...register("block")}
                />
              </Col>
              <Col>
                <Form.Label>Street</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.street || ""}
                  placeholder="Enter Street"
                  size="sm"
                  {...register("street")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Landmark</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.landmark || ""}
                  placeholder="Enter Landmark"
                  size="sm"
                  {...register("landmark")}
                />
              </Col>
              <Col>
                <Form.Label>Area</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.area || ""}
                  placeholder="Enter Area"
                  size="sm"
                  {...register("area")}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Country</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  isInvalid={!!errors.country}
                >
                  <option value="">Select Country</option>
                  {countryList?.map((country) => (
                    <option key={country.shortName} value={country.shortName}>
                      {country.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>State / Province</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedState}
                  onChange={handleStateChange}
                  isInvalid={!!errors.state}
                >
                  <option value="">Select State</option>
                  {stateList?.length > 0 &&
                    stateList?.map((state) => (
                      <option key={state.name} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>City</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedCity}
                  onChange={(e) => {
                    const city = e.target.value;
                    setSelectedCity(city);
                    setValue("city", city, { shouldDirty: true });
                  }}
                  isInvalid={!!errors.city}
                >
                  <option value="">Select City</option>
                  {cityList?.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Zip / Postal Code</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.zip_code || ""}
                  placeholder="Enter Zip or Postal Code"
                  size="sm"
                  {...register("zip_code")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  defaultValue={rowData?.description || ""}
                  placeholder="Enter Description"
                  size="sm"
                  {...register("description")}
                />
              </Col>
            </Row>
          </div>
          <Modal.Footer style={{ position: "sticky" }}>
            <button
              onClick={onHide}
              type="button"
              className="model-btn-cancel rounded border-0 py-1"
            >
              Cancel
            </button>
            <button
              className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
              type="submit"
              disabled={!isDirty}
            >
              {rowData?.id ? "Update" : "Save"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AccountModal;
