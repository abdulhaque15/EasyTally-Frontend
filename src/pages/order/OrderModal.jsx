import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { FaTrash, FaPlus } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../../api/uvCapitalApi"; 
import toast  from 'react-hot-toast';

const OrderModal = ({ show, onHide,rowData = {}, setRefreshTable, isEditData}) => {  
  const {handleSubmit, formState: { isDirty }, reset} = useForm(); 
  const [orderDetailData, setOrderDetailData ] = useState([]);
  const [orderOLIDetailData, setOrderOLIDetailData ] = useState([]);  
  useEffect(() => {
    if (show) {
      reset({
        id: rowData?.id || "",
        order_date__c: rowData?.order_date__c || "",
        status__c: rowData?.status__c || "",
      });
    } 
    if(rowData?.id){
      fetchOrderAndOLIDataById(rowData?.id); 
    } 
  }, [show]);


  const fetchOrderAndOLIDataById = async (recordId) => { 
    const orderResponse = await uvCapitalApi.getOrderDetailDataById(recordId); 
    const orderOLIResponse = await uvCapitalApi.getOrderOLIDetailById(recordId);  
    setOrderDetailData(orderResponse?.data?.[0] ?? []);
    setOrderOLIDetailData(orderOLIResponse?.data ?? []);
  }

  const addLineItem = () => {
    const newItem = {
      id: Date.now(), // temporary ID for React key
      stock_item_name: "",
      rate__c: "",
      quantity__c: "",
      units__c: "",
      amount__c: ""
    };
    setOrderOLIDetailData([...orderOLIDetailData, newItem]);
  };

  const removeLineItem = (id) => {
    setOrderOLIDetailData(orderOLIDetailData.filter(item => item.id !== id));
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...orderOLIDetailData];
    updatedItems[index][field] = value;

    // Auto-calculate amount = rate × quantity if applicable
    if (field === "rate__c" || field === "quantity__c") {
      const rate = parseFloat(updatedItems[index].rate__c) || 0;
      const qty = parseFloat(updatedItems[index].quantity__c) || 0;
      updatedItems[index].amount__c = rate * qty;
    }

    setOrderOLIDetailData(updatedItems);
  };
 
  const handleClose = () => { 
    onHide(); 
  } 

  const onSubmit = async () => {  
  
    /*try {
      let response;        
      if (rowData?.id) {
        response = await uvCapitalApi.updateLedger(rowData.id, payload);
        toast.success(response?.message || "Ledger updated successfully");
        setRefreshTable(true);
      } else {
        response = await uvCapitalApi.createLedger(payload);
        toast.success(response?.message || "Ledger created successfully");
      }
      onHide();
    } catch (error) {
      console.error("Error saving ledger:", error);
      toast.error("Something went wrong while saving the ledger.");
    }*/
  };

  return (
    <Modal show={show} size="xl">
        <Modal.Header style={{height: '100%'}}>
            <div className="d-flex align-items-center">
                <div className="modal-icon me-3">
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="em" width="1em" style={{color: "#15a362"}} xmlns="http://www.w3.org/2000/svg">
                        <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path>
                    </svg>
                </div>
                <div>
                    <h5 className="modal-title mb-0">{orderDetailData.name}</h5>
                    <small className="text-dark">Order Details</small>
                </div>
            </div>
            <button type="button" onClick={handleClose} className="btn-close"></button>
        </Modal.Header>
        <Modal.Body >
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className='details-section mb-3'>
                <h6 class="section-title"><i class="fas fa-info-circle me-2"></i>Basic Information</h6>
                <div className="row mt-3">
                    <div className="col-md-6">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Name</label>
                            <div class="detail-value-compact">{orderDetailData.name}</div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Total Amount</label>
                            <div class="detail-value-compact">{orderDetailData.total_amount__c}</div>
                        </div>
                    </div>
                    <div className="col-md-6 mt-3">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Order Date</label> 
                            <input 
                            type="date"
                            className="form-control"
                           value={
                              orderDetailData.order_date__c 
                                ? new Date(orderDetailData.order_date__c).toISOString().split("T")[0] 
                                : ""
                            }
                            onChange={(e) => setOrderDetailData({
                              ...orderDetailData, 
                              order_date__c: e.target.value
                            })}
                            required
                          />
                        </div>
                    </div>
                    <div className="col-md-6 mt-3">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Type</label>
                            <div class="detail-value-compact">{orderDetailData.type__c}</div>
                        </div>
                    </div>
                    <div className="col-md-6 mt-3">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Status</label>
                            <select
                              className="form-control mt-1"
                              value={orderDetailData.status__c || ""}
                              onChange={(e) =>
                                setOrderDetailData({
                                  ...orderDetailData,
                                  status__c: e.target.value,
                                })
                              }
                              required
                            > 
                              <option value="Draft">Draft</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-6 mt-3">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Party Ledger</label>
                            <div class="detail-value-compact">{orderDetailData.ledger_name}</div>
                        </div>
                    </div>
                    <div className="col-md-6 mt-3">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Sales Ledger</label>
                            <div class="detail-value-compact">{orderDetailData.sales_ledger_name}</div>
                        </div>
                    </div>
                    <div className="col-md-6 mt-3">
                        <div class="detail-item-compact">
                            <label class="detail-label-compact">Tally Sync</label>
                            <div class="detail-value-compact">{orderDetailData.tally_sync__c}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='details-section mb-3'>
              <div className="line-items-header">
                <h3>Line Items</h3>
                <button
                type="button"
                className="btn btn-success"
                onClick={addLineItem}
                >
                <FaPlus /> Add Line Item
                </button>
            </div>
                
                <div className="OLI-details-section row mt-3">
                    <div className="table-responsive">
                        <table className="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th>Item/Ledger</th>
                                    <th>Rate</th>
                                    <th>Quantity</th>
                                    <th>Units</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                              {orderOLIDetailData.map((item, index) => (
                                <tr key={item.id}>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      value={item.stock_item_name}
                                      onChange={(e) => handleLineItemChange(index, "stock_item_name", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={item.rate__c}
                                      onChange={(e) => handleLineItemChange(index, "rate__c", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={item.quantity__c}
                                      onChange={(e) => handleLineItemChange(index, "quantity__c", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      value={item.units__c}
                                      onChange={(e) => handleLineItemChange(index, "units__c", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={item.amount__c}
                                      readOnly
                                    />
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => removeLineItem(item.id)}
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal.Footer> 
              <button type="button" onClick={handleClose} class="btn btn-secondary"><i className="fas fa-times me-1"></i>Close</button>
              <button
                className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
                type="submit" 
              >
                Update
              </button>
            </Modal.Footer>
          </Form>
        </Modal.Body> 
    </Modal>
  );
};
export default OrderModal;