import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../../api/uvCapitalApi";
import toast from "react-hot-toast";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import ccsj from "countrycitystatejson";

const ContactModal = ({
  show,
  onHide,
  rowData = {},
  setRefreshTable,
  onContactCreated,
}) => {
  const [accountList, setAccountList] = useState([]);
  const [status, setStatus] = useState();
  const { permissions } = useAuthWrapper();

  const [billingCountryList, setBillingCountryList] = useState([]);
  const [billingStateList, setBillingStateList] = useState([]);
  const [billingCityList, setBillingCityList] = useState([]);
  const [selectedBillingCountry, setSelectedBillingCountry] = useState("");
  const [selectedBillingState, setSelectedBillingState] = useState("");
  const [selectedBillingCity, setSelectedBillingCity] = useState("");

  const [shippingCountryList, setShippingCountryList] = useState([]);
  const [shippingStateList, setShippingStateList] = useState([]);
  const [shippingCityList, setShippingCityList] = useState([]);
  const [selectedShippingCountry, setSelectedShippingCountry] = useState("");
  const [selectedShippingState, setSelectedShippingState] = useState("");
  const [selectedShippingCity, setSelectedShippingCity] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    fetchModuleStatus();
    if (show) {
      reset({
        account_id: rowData?.account_id || null,
        type: rowData?.type || "", //new
        salutation: rowData?.salutation || "",
        first_name: rowData?.first_name || "",
        last_name: rowData?.last_name || "",
        email: rowData?.email || "",
        mobile: rowData?.mobile || "",
        phone: rowData?.phone || "",
        home_phone: rowData?.home_phone || "",
        other_phone: rowData?.other_phone || "",
        contact_person: rowData?.contact_person || "", //new
        currency: rowData?.currency || "", //new
        payment_term: rowData?.payment_term || "", //new
        egcg_term: rowData?.egcg_term || "", //new
        policy_no: rowData?.policy_no || "", //new
        policy_expiry_date: rowData?.policy_expiry_date || null, //new
        buying_agent: rowData?.buying_agent || "", //new
        status: rowData?.status || "", //new
        fax: rowData?.fax || "",
        birthday: rowData?.birthday || null,
        billing_street: rowData?.billing_street || "", //new
        billing_city: rowData?.billing_city || "", //new
        billing_state: rowData?.billing_state || "", //new
        billing_country: rowData?.billing_country || "", //new
        shipping_street: rowData?.shipping_street || "", //new
        shipping_city: rowData?.shipping_city || "", //new
        shipping_state: rowData?.shipping_state || "", //new
        shipping_country: rowData?.shipping_country || "", //new
        street: rowData?.street || "",
        city: rowData?.city || "",
        state: rowData?.state || "",
        country: rowData?.country || "",
        zip: rowData?.zip || "",
        description: rowData?.description || "",
      });

      const all = ccsj.getCountries();
      if (rowData?.country) {
        const match = all.find((c) => c.name === rowData.country);
        if (match) {
          setSelectedBillingCountry(match.shortName);
          setValue("billing_country", match.name, { shouldDirty: false });

          const statesObj = ccsj.getStatesByShort(match.shortName);
          const stateArray = statesObj
            ? Object.keys(statesObj).map((k) => ({
                shortName: k,
                name: statesObj[k],
              }))
            : [];
          setBillingStateList(stateArray);

          if (rowData?.state) {
            setSelectedBillingState(rowData.state);
            setValue("billing_state", rowData.state, { shouldDirty: false });

            const cities = ccsj.getCities(match.shortName, rowData.state) || [];
            setBillingCityList(cities);
            setSelectedBillingCity(rowData.city || "");
            setValue("billing_city", rowData.city || "", {
              shouldDirty: false,
            });
          }
        }
      } else {
        setSelectedBillingCountry("");
        setValue("billing_country", "", { shouldDirty: false });
        setBillingStateList([]);
        setBillingCityList([]);
        setSelectedBillingState("");
        setSelectedBillingCity("");
      }
    }
  }, [show]);

  const fetchModuleStatus = async () => {
    const response = await uvCapitalApi.getListOfModuleStatus(
      permissions?.contact?.id
    );
    if (response?.success && Array.isArray(response?.data)) {
      const formatted = response.data
        .filter((item) => item?.isactive)
        .map((item) => ({
          id: item.id,
          status: item.status?.trim(),
        }));
      setStatus(formatted);
    } else {
      setStatus([]);
    }
  };

  useEffect(() => {
    const countries = ccsj.getCountries();
    setBillingCountryList(countries);
    setShippingCountryList(countries);
  }, []);

  const handleBillingCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedBillingCountry(countryCode);

    const all = ccsj.getCountries();
    const picked = all.find((c) => c.shortName === countryCode);

    setValue("billing_country", picked ? picked.name : "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setSelectedBillingState("");
    setSelectedBillingCity("");
    setBillingCityList([]);

    const statesObj = ccsj.getStatesByShort(countryCode);
    const stateArray = statesObj
      ? Object.keys(statesObj).map((k) => ({
          shortName: k,
          name: statesObj[k],
        }))
      : [];
    setBillingStateList(stateArray);
  };

  const handleBillingStateChange = (e) => {
    const stateName = e.target.value;
    setSelectedBillingState(stateName);
    setValue("billing_state", stateName, { shouldDirty: true });

    const cities = ccsj.getCities(selectedBillingCountry, stateName) || [];
    setBillingCityList(cities);
    setSelectedBillingCity("");
    setValue("billing_city", "", { shouldDirty: true });
  };

  const handleShippingCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedShippingCountry(countryCode);

    const all = ccsj.getCountries();
    const picked = all.find((c) => c.shortName === countryCode);

    setValue("shipping_country", picked ? picked.name : "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setSelectedShippingState("");
    setSelectedShippingCity("");
    setShippingCityList([]);

    const statesObj = ccsj.getStatesByShort(countryCode);
    const stateArray = statesObj
      ? Object.keys(statesObj).map((k) => ({
          shortName: k,
          name: statesObj[k],
        }))
      : [];
    setShippingStateList(stateArray);
  };

  const handleShippingStateChange = (e) => {
    const stateName = e.target.value;
    setSelectedShippingState(stateName);
    setValue("shipping_state", stateName, { shouldDirty: true });

    const cities = ccsj.getCities(selectedShippingCountry, stateName) || [];
    setShippingCityList(cities);
    setSelectedShippingCity("");
    setValue("shipping_city", "", { shouldDirty: true });
  };

  const onSubmit = async (formData) => {
    const allCountries = ccsj.getCountries();

    const billingCountryObj = allCountries.find(
      (c) => c.shortName === selectedBillingCountry
    );

    const shippingCountryObj = allCountries.find(
      (c) => c.shortName === selectedShippingCountry
    );

    const payload = {
      ...formData,

      billing_country: billingCountryObj ? billingCountryObj.name : "",
      billing_state: selectedBillingState || "",
      billing_city: selectedBillingCity || "",

      shipping_country: shippingCountryObj ? shippingCountryObj.name : "",
      shipping_state: selectedShippingState || "",
      shipping_city: selectedShippingCity || "",
    };

    try {
      let response;
      if (rowData?.id) {
        response = await uvCapitalApi.updateContact(rowData.id, payload);
        toast.success(response?.message);
        setRefreshTable(true);
      } else {
        response = await uvCapitalApi.createContact(payload);
        toast.success(response?.message);
        if (response?.success && onContactCreated) {
          onContactCreated(response?.data);
        }
      }
      onHide();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast.error("Something went wrong while saving the partner.");
    }
  };

  useEffect(() => {
    (async () => {
      let response = await uvCapitalApi.getListOfAccounts();
      if (response.success) {
        setAccountList(response.data);
      } else {
        setAccountList([]);
      }
    })();
  }, []);

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
          {rowData?.id ? "Edit Partner" : "Add New Partner"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="fs-5 ms-auto icon-default" />
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
                <Form.Label>Company Master</Form.Label>
                <Form.Select
                  {...register("account_id")}
                  defaultValue={rowData?.account_id || ""}
                  onChange={(e) => {
                    const accountId = e.target.value;
                    setValue("account_id", accountId);
                    const selectedAccount = accountList.find(
                      (account) => account.id === accountId
                    );

                    if (selectedAccount) {
                      setValue("currency", selectedAccount.currency || "");
                      setValue("street", selectedAccount.street || "");
                      setValue("city", selectedAccount.city || "");
                      setValue("state", selectedAccount.state || "");
                      setValue("country", selectedAccount.country || "");
                      setValue("zip", selectedAccount.zip || "");
                    }
                  }}
                  size="sm"
                >
                  <option value="">Select</option>
                  {accountList?.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  defaultValue={rowData?.type || ""}
                  {...register("type")}
                  size="sm"
                >
                  <option value="">Select</option>
                  <option>New</option>
                  <option>Old</option>
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Salutation</Form.Label>
                <Form.Select
                  defaultValue={rowData?.salutation || ""}
                  {...register("salutation")}
                  size="sm"
                >
                  <option value="">Select</option>
                  <option>Mr.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                  <option>Mrs.</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>First Name</span>
                  {errors.first_name && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.first_name.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First name"
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                  isInvalid={!!errors.first_name}
                  defaultValue={rowData?.first_name || ""}
                  size="sm"
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.last_name || ""}
                  placeholder="Enter Last Name"
                  size="sm"
                  {...register("last_name")}
                />
              </Col>
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
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Mobile</span>
                  {errors.mobile && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.mobile.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.mobile || ""}
                  placeholder="Enter Mobile"
                  size="sm"
                  isInvalid={!!errors.mobile}
                  {...register("mobile", {
                    min: {
                      value: 1000000000,
                      message: "Mobile must be exactly 10 digits",
                    },
                    max: {
                      value: 9999999999,
                      message: "Mobile must be exactly 10 digits",
                    },
                  })}
                  onInput={(e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  }}
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
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Home Phone</span>
                  {errors.home_phone && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.home_phone.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.home_phone || ""}
                  placeholder="Enter Home Phone"
                  size="sm"
                  isInvalid={!!errors.home_phone}
                  {...register("home_phone", {
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
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Other Phone</span>
                  {errors.other_phone && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.other_phone.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.other_phone || ""}
                  placeholder="Enter Other Phone"
                  size="sm"
                  isInvalid={!!errors.other_phone}
                  {...register("other_phone", {
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
            <Row className="mb-4">
              <Col>
                <Form.Label>Contact Person</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.contact_person || ""}
                  placeholder="Enter contact person"
                  size="sm"
                  {...register("contact_person")}
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
            <Row className="mb-4">
              <Col>
                <Form.Label>Payment Term</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.payment_term || ""}
                  placeholder="Enter payment term"
                  size="sm"
                  {...register("payment_term")}
                />
              </Col>
              <Col>
                <Form.Label>EGCG Term</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.egcg_term || ""}
                  placeholder="Enter EGCG term"
                  size="sm"
                  {...register("egcg_term")}
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <Form.Label>Policy No.</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.policy_no || ""}
                  placeholder="Enter policy no"
                  size="sm"
                  {...register("policy_no")}
                />
              </Col>
              <Col>
                <Form.Label>Policy Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  defaultValue={rowData?.policy_expiry_date || null}
                  size="sm"
                  {...register("policy_expiry_date")}
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <Form.Label>Buying Agent</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.buying_agent || ""}
                  placeholder="Enter buying agent"
                  size="sm"
                  {...register("buying_agent")}
                />
              </Col>
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Status</span>
                  {errors.status && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.status.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Select
                  size="sm"
                  {...register("status", {
                    required: "Status is required",
                  })}
                  isInvalid={!!errors.status}
                >
                  {status?.map((status) => (
                    <option key={status?.id} value={status?.status}>
                      {status?.status}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-4">
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
              <Col>
                <Form.Label>Birthday</Form.Label>
                <Form.Control
                  type="date"
                  defaultValue={rowData?.birthday || null}
                  size="sm"
                  {...register("birthday")}
                />
              </Col>
            </Row>

            <Row
              lg={12}
              sm={12}
              xs={12}
              className="ps-3 py-2 mb-3 section-header"
            >
              BILLING & SHIPPING ADDRESS INFORMATION
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Billing Country</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedBillingCountry}
                  onChange={handleBillingCountryChange}
                >
                  <option value="">Select Billing Country</option>
                  {billingCountryList?.map((country) => (
                    <option key={country.shortName} value={country.shortName}>
                      {country.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Shipping Country</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedShippingCountry}
                  onChange={handleShippingCountryChange}
                >
                  <option value="">Select Shipping Country</option>
                  {shippingCountryList?.map((country) => (
                    <option key={country.shortName} value={country.shortName}>
                      {country.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Billing State</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedBillingState}
                  onChange={handleBillingStateChange}
                >
                  <option value="">Select Billing State</option>
                  {billingStateList?.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Shipping State</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedShippingState}
                  onChange={handleShippingStateChange}
                >
                  <option value="">Select Shipping State</option>
                  {shippingStateList?.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Billing City</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedBillingCity}
                  onChange={(e) => {
                    const city = e.target.value;
                    setSelectedBillingCity(city);
                    setValue("billing_city", city, { shouldDirty: true });
                  }}
                >
                  <option value="">Select City</option>
                  {billingCityList?.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Shipping City</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedShippingCity}
                  onChange={(e) => {
                    const city = e.target.value;
                    setSelectedShippingCity(city);
                    setValue("shipping_city", city, { shouldDirty: true });
                  }}
                >
                  <option value="">Select City</option>
                  {shippingCityList?.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Billing Street</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.billing_street || ""}
                  placeholder="Enter Billing street"
                  size="sm"
                  {...register("billing_street")}
                />
              </Col>
              <Col>
                <Form.Label>Shipping Street</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.shipping_street || ""}
                  placeholder="Enter shipping street"
                  size="sm"
                  {...register("shipping_street")}
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
              <Col md={12}>
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
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.city || ""}
                  placeholder="Enter City"
                  size="sm"
                  {...register("city")}
                />
              </Col>
              <Col>
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.state || ""}
                  placeholder="Enter State"
                  size="sm"
                  {...register("state")}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Zip</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.zip || ""}
                  placeholder="Enter Zip"
                  size="sm"
                  {...register("zip")}
                />
              </Col>
              <Col>
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.country || ""}
                  placeholder="Enter Country"
                  size="sm"
                  {...register("country")}
                />
              </Col>
            </Row>
            <h6 className="mb-3 mt-4">Description</h6>
            <Row className="mb-3">
              <Col>
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
              type="button"
              onClick={onHide}
              className="model-btn-cancel rounded border-0 py-1"
            >
              Cancel
            </button>
            <button
              className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
              type="submit"
              disabled={!isDirty}
            >
              Save
            </button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ContactModal;
