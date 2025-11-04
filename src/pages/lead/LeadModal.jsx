import { useEffect, useState } from "react";
import { Col, Form, Modal, Row } from "react-bootstrap";
import { FaWindowClose } from "react-icons/fa";
import { useForm } from "react-hook-form";
import {
  LEAD_SOURCE,
  LEAD_INDUSTRY,
  LEAD_RATING,
  LEAD_INTERESTED_IN,
} from "../../helper/Constraints";
import uvCapitalApi from "../../api/uvCapitalApi";
import toast  from 'react-hot-toast';
import { useAuthWrapper } from "../../helper/AuthWrapper";
import ccsj from "countrycitystatejson";

const LeadModal = ({ show, onHide, rowData = {}, mode, setRefreshTable }) => {
  const { permissions, userList } = useAuthWrapper();
  const [status, setStatus] = useState();
  const [accountList, setAccountList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      salutation: "",
      lead_source: "",
      lead_interested_in: "",
      lead_status: "New",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      mobile: "",
      title: "",
      gender: "",
      advanced_amount: "",
      account_name: "",
      account_phone: "",
      account_email: "",
      industry: "",
      no_of_employee: "",
      website: "",
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      description: "",
      rating: "",
      owner_id: "",
      account_id: "",
      contact_id: "",
    },
  });

  useEffect(() => {
    fetchModuleStatus();
    if (show) {
      reset({
        salutation: rowData.salutation || "",
        lead_source: rowData.lead_source || "",
        lead_interested_in: rowData.lead_interested_in || "",
        lead_status: rowData.lead_status || "New",
        first_name: rowData.first_name || "",
        last_name: rowData.last_name || "",
        email: rowData.email || "",
        phone: rowData.phone || "",
        mobile: rowData.mobile || "",
        title: rowData.title || "",
        gender: rowData.gender || "",
        advanced_amount: rowData.advanced_amount || "",
        account_name: rowData.account_name || "",
        account_phone: rowData.account_phone || "",
        account_email: rowData.account_email || "",
        industry: rowData.industry || "",
        no_of_employee: rowData.no_of_employee || "",
        website: rowData.website || "",
        street: rowData.street || "",
        city: rowData.city || "",
        state: rowData.state || "",
        zip_code: rowData.zip_code || "",
        country: rowData.country || "",
        description: rowData.description || "",
        rating: rowData.rating || "",
        owner_id: rowData.owner_id || "",
        account_id: rowData.account_id || "",
        contact_id: rowData.contact_id || "",
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
    if (rowData && show && mode !== "create") {
      const clonedData = { ...rowData };

      if (mode === "clone") {
        delete clonedData.id;
        clonedData.lead_id = "";
        clonedData.reference_id = "";
      }

      const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";

      const resetObj = {
        ...clonedData,
        expected_close_date: formatDate(clonedData.expected_close_date),
        next_follow_up_date: formatDate(clonedData.next_follow_up_date),
        last_contacted_date: formatDate(clonedData.last_contacted_date),
      };

      reset(resetObj);
    }
  }, [rowData, show, mode, reset]);

  const onSubmit = async (data) => {
    const currentMode = mode || "create";
    const allCountries = ccsj.getCountries();
    const selected = allCountries.find((c) => c.shortName === selectedCountry);
    const finalPayload = {
      ...data,
      fax: null,
      country: selected ? selected?.name : "",
    };
    if (currentMode === "edit") {
      if (!rowData?.id) {
        console.error("Missing rowData.id for update");
        return;
      }
      let response = await uvCapitalApi.updateLead(rowData.id, finalPayload);
      toast.success(response?.message);
      setRefreshTable(true);
      onHide();
    } else {
      let response = await uvCapitalApi.createLeadRecord(finalPayload);
      toast.success(response?.message);
      onHide();
      setRefreshTable(true);
    }
  };

  const fetchModuleStatus = async () => {
    const response = await uvCapitalApi.getListOfModuleStatus(permissions?.lead?.id);
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

    const accountData = await uvCapitalApi.getListOfAccounts();
    setAccountList(accountData.data);
    const contactData = await uvCapitalApi.getListOfContacts();
    setContactList(contactData.data);
  };

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


  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="xl"
      backdrop="static"
      scrollable
    >
      <Modal.Header>
        <Modal.Title className="detail-h1">
          {rowData?.id ? "Edit Lead" : "Add New Lead"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="fs-5 ms-auto icon-default" />
      </Modal.Header>

      <Modal.Body className="detail-h3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row
            lg={12}
            sm={12}
            xs={12}
            className="ps-3 py-2 mb-3 section-header"
          >
            Personal Details
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Salutation</Form.Label>
              <Form.Select {...register("salutation")} size="sm">
                <option value="">Select Salutation</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Miss">Miss</option>
                <option value="Dr.">Dr.</option>
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
                placeholder="Enter First Name"
                {...register("first_name", {
                  required: "First name is required",
                })}
                isInvalid={!!errors.first_name}
                size="sm"
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label className="d-flex justify-content-between align-items-center">
                <span>Last Name</span>
                {errors.last_name && (
                  <span
                    className="text-danger ms-2"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {errors.last_name.message}
                  </span>
                )}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Last Name"
                {...register("last_name", {
                  required: "Last name is required",
                })}
                isInvalid={!!errors.last_name}
                size="sm"
              />
            </Col>
            <Col>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email"
                {...register("email", {
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                isInvalid={!!errors.email}
                size="sm"
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Phone"
                {...register("phone")}
                size="sm"
              />
            </Col>
            <Col>
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Mobile"
                {...register("mobile")}
                size="sm"
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Job Title"
                {...register("title")}
                size="sm"
              />
            </Col>
            <Col>
              <Form.Label>Gender</Form.Label>
              <Form.Select {...register("gender")} size="sm">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Form.Select>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Country</Form.Label>
              <Form.Select
                size="sm"
                value={selectedCountry}
                onChange={(e) => {
                  handleCountryChange(e);
                }}
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
                onChange={(e) => {
                  handleStateChange(e);
                }}
                isInvalid={!!errors.state}
              >
                <option value="">Select State</option>
                {stateList?.length > 0 &&
                  stateList.map((state) => (
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
                  setValue("city", city);
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
              <Form.Label>Street</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Street"
                {...register("street")}
                size="sm"
              />
            </Col>
          </Row>
          <Row className="mb-3">
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
            <Col></Col>
          </Row>
          <Row
            lg={12}
            sm={12}
            xs={12}
            className="ps-3 py-2 mb-3 section-header"
          >
            Lead Information
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Lead Interested In</Form.Label>
              <Form.Select {...register("lead_interested_in")} size="sm">
                <option value="">Select Interested In</option>
                {LEAD_INTERESTED_IN?.map((val) => (
                  <option key={val.value} value={val.label}>
                    {val.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Label>Lead Source</Form.Label>
              <Form.Select {...register("lead_source")} size="sm">
                <option value="">Select Source</option>
                {LEAD_SOURCE?.map((val) => (
                  <option key={val.value} value={val.label}>
                    {val.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label className="d-flex justify-content-between align-items-center">
                <span>Status</span>
                {errors.lead_status && (
                  <span
                    className="text-danger ms-2"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {errors.lead_status.message}
                  </span>
                )}
              </Form.Label>
              <Form.Select
                  size="sm"
                  {...register("lead_status", {
                    required: "Lead status is required",
                  })}
                  isInvalid={!!errors.status}
                >
                <option value="">Select Lead Status</option>
                {status?.map((status) => (
                  <option key={status?.id} value={status?.status}>
                    {status?.status}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Label>Rating</Form.Label>
              <Form.Select {...register("rating")} size="sm">
                <option value="">Select Rating</option>
                {LEAD_RATING?.map((val) => (
                  <option key={val.label} value={val.value}>
                    {val.value}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Owner</Form.Label>
              <Form.Select {...register("owner_id")} size="sm">
                <option value="">Select Owner</option>
                {userList?.map((val) => (
                  <option key={val.id} value={val.id}>
                    {val.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                {...register("description")}
                size="sm"
              />
            </Col>
          </Row>

          <Row
            lg={12}
            sm={12}
            xs={12}
            className="ps-3 py-2 mb-3 section-header"
          >
            Other Details
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Account Master</Form.Label>
              <Form.Select {...register("account_id")} size="sm">
                <option value="">Select Account Master</option>
                {accountList?.map((val) => (
                  <option key={val.id} value={val?.id}>
                    {val?.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Label>Contact Master</Form.Label>
              <Form.Select {...register("contact_id")} size="sm">
                <option value="">Select Contact Master</option>
                {contactList?.map((val) => (
                  <option key={val.id} value={val?.id}>
                    {val?.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>Company Website</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Company Website"
                {...register("website")}
                size="sm"
              />
            </Col>
            <Col>
              <Form.Label>Industry</Form.Label>
              <Form.Select {...register("industry")} size="sm">
                <option value="">Select Industry</option>
                {LEAD_INDUSTRY?.map((val, index) => (
                  <option key={index} value={val?.value}>
                    {val?.value}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onHide}
          type="button"
          className="model-btn-cancel rounded border-0 py-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty}
          className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
        >
          {rowData?.id ? "Update" : "Save"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default LeadModal;
