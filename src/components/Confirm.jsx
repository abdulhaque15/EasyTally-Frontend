import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const Confirm = (props) => {
    const [show, setShow] = useState(true);
console.log(props.table);

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Alert show={show} variant="danger" className="mb-0">
                <Alert.Heading>{props.title}</Alert.Heading>
                <p className="fs-5">{props.message}</p>
                <hr />
                <div className="d-flex justify-content-end">
                    {props.table === "contactDataTable" && (
                        <Button
                            onClick={props.confimDeleteButton}
                            variant="danger"
                            className="mx-2"
                        >
                            Yes
                        </Button>
                    )}
                    {props.table === "contactDetailsTable" && (
                        <Button
                            onClick={props.confimDeleteButton}
                            variant="danger"
                            className="mx-2"
                        >
                            Yes
                        </Button>
                    )}
                    
                    {props.table === "accountDetailsTable" && (
                        <Button
                            onClick={props.confimDeleteButton}
                            variant="danger"
                            className="mx-2"
                        >
                            Yes
                        </Button>
                    )}
                    
                    {props.table === "accountDataTable" && (
                        <Button
                            onClick={props.confimDeleteButton}
                            variant="danger"
                            className="mx-2"
                        >
                            Yes
                        </Button>
                    )}
                    <Button onClick={props.onHide} variant="light" className="text-">
                        No
                    </Button>
                </div>
            </Alert>
        </Modal>
    )
}

export default Confirm;