import React, { useEffect, useState } from "react";
import { Modal, Table, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import toast  from 'react-hot-toast';
import uvCapitalApi from "../../api/uvCapitalApi";
import {useAuthWrapper } from "../../helper/AuthWrapper"
import { LogarithmicScale } from "chart.js";

const PermissionModal = ({ show, onHide, rowData = {}, setRefreshTable }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { fetchPermissions } = useAuthWrapper();
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (!show) return;

    reset({
      group_name: rowData?.name || "",
      total_members: rowData?.total_members || "",
      description: rowData?.description || "",
    });

    const fetchAndFormatPermissions = async () => {
      try {
        const res = await uvCapitalApi.getAllModule();
        const allModules = res?.data || [];

        const formattedPermissions = allModules.map((mod) => {
          const existing = rowData?.modules?.[mod.name];
          return {
            module: mod.name,
            module_id: mod.id,
            view_all: existing?.view_all ?? false,
            tab_view: existing?.tab_view ?? false,
            create: existing?.create ?? false,
            edit: existing?.edit ?? false,
            delete: existing?.delete ?? false,
            owner: existing?.owner ?? false,
          };
        });

        setPermissions(formattedPermissions);
      } catch (error) {
        console.error("Module fetch error:", error);
        setPermissions([]);
      }
    };

    fetchAndFormatPermissions();
  }, [show]);

  const handleCheckboxChange = (index, action) => {
    setPermissions((prevPermissions) => {
      const updated = [...prevPermissions];

      if (action === "all") {
        const allChecked = !(
          updated[index].view_all &&
          updated[index].tab_view &&
          updated[index].create &&
          updated[index].edit &&
          updated[index].delete &&
          updated[index].owner
        );
        updated[index] = {
          ...updated[index],
          view_all: allChecked,
          tab_view: allChecked,
          create: allChecked,
          edit: allChecked,
          delete: allChecked,
          owner: allChecked,
        };
      } else {
        updated[index] = {
          ...updated[index],
          [action]: !updated[index][action],
        };
      }

      return updated;
    });
  };

  const onSubmit = async (formData) => {
    const module_permissions = permissions.map((perm) => ({
      module_id: perm.module_id,
      can_create: perm.create,
      tab_view: perm.tab_view,
      can_update: perm.edit,
      can_delete: perm.delete,
      owner: perm.owner,
      view_all: perm.view_all,
    }));

    const payload = {
      group_name: formData.group_name,
      description: formData.description,
      total_members: formData.total_members,
      isactive: true,
      module_permissions,
    };

    if (rowData?.group_id || rowData?.id) {
          if (!rowData?.id) {
            console.error("Missing rowData.id for update");
            return;
          }
          let response = await uvCapitalApi.updateGroupsAndPermissions(rowData.group_id || rowData?.id, payload);
          toast.success(response?.message);
          setRefreshTable(true);
          onHide();
        } else {
          let response = await uvCapitalApi.createGroupsAndPermissions(payload);
          toast.success(response?.message);
          onHide();
          setRefreshTable(true);
        }
        await fetchPermissions();
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
          {rowData?.group_id ? "Edit Permission" : "Add New Permission"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
      </Modal.Header>
      <Modal.Body className="detail-h3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div
            style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
          >
            <Row className="ps-3 py-2 mb-3 section-header">
              Basic Information
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>
                  Group Name{" "}
                  {errors.group_name && (
                    <span className="text-danger">
                      ({errors.group_name.message})
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Group Name"
                  size="sm"
                  {...register("group_name", {
                    required: "Group Name is required",
                  })}
                  isInvalid={!!errors.group_name}
                />
              </Col>
              <Col>
                <Form.Label>Total Members</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Total Members"
                  size="sm"
                  disabled
                  {...register("total_members")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter Description"
                  size="sm"
                  {...register("description")}
                />
              </Col>
            </Row>

            <Row className="ps-3 py-2 mb-3 section-header">
              Module Permission
            </Row>
            <Row>
              <Table responsive borderless className="text-center align-middle">
                <thead>
                  <tr>
                    <th>Module Name</th>
                    <th>View Records</th>
                    <th>View</th>
                    <th>Create</th>
                    <th>Edit</th>
                    <th>Delete</th>
                    <th>Owner</th>
                    <th>All</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions?.map((item, index) => {
                    const allChecked =
                      item.view_all &&
                      item.tab_view &&
                      item.create &&
                      item.edit &&
                      item.delete &&
                      item.owner;
                    return (
                      <tr key={item.module}>
                        <td className="text-start">{item.module}</td>
                        {[
                          "view_all",
                          "tab_view",
                          "create",
                          "edit",
                          "delete",
                          "owner",
                        ]?.map((action) => (
                          <td key={action}>
                            <Form.Check
                              type="checkbox"
                              checked={item[action]}
                              onChange={() =>
                                handleCheckboxChange(index, action)
                              }
                            />
                          </td>
                        ))}
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={allChecked}
                            onChange={() => handleCheckboxChange(index, "all")}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Row>
          </div>
          <Modal.Footer>
            <button
              onClick={onHide}
              className="model-btn-cancel rounded border-0 py-1"
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
              type="submit"
            >
              Save
            </button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PermissionModal;