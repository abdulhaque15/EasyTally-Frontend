import React from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { useParams } from 'react-router-dom';
import uvCapitalApi from '../api/uvCapitalApi';
import toast, { Toaster } from 'react-hot-toast';
const ClientConfirmation = () => {
    const  { id } = useParams();
    const clientConfirm = async () => {
        try{
            let response = await uvCapitalApi.getLeadById(id);
            if(response.success){
                let confirmClient = await uvCapitalApi.confirmClientIntoProject(response.data);
                console.log('confirmClient' , confirmClient)
                if(confirmClient.success){
                    toast.success(confirmClient.message);
                    // let notifications = await uvCapitalApi.createNotifications(payload);
                    const convertedData = confirmClient.data;
                        const payload = [
                        {
                            name: "Account Created",
                            description: `Account '${convertedData.accountResponse[0]?.name}' created successfully.`,
                            user_id: convertedData.leadStatusResponse[0]?.owner_id,
                            type: "unread",
                            status: "active",
                            record_id: convertedData.accountResponse[0]?.id
                        },
                        {
                            name: "Contact Created",
                            description: `Contact '${convertedData.contactResponse[0]?.first_name} ${convertedData.contactResponse[0]?.last_name}' created successfully.`,
                            user_id: convertedData.leadStatusResponse[0]?.owner_id,
                            type: "unread",
                            status: "active",
                            record_id: convertedData.contactResponse[0]?.id
                        },
                        {
                            name: "Project Created",
                            description: `Project '${convertedData.projectResponse[0]?.name}' created successfully.`,
                            user_id: convertedData.leadStatusResponse[0]?.owner_id,
                            type: "unread",
                            status: "active",
                            record_id: convertedData.projectResponse[0]?.id
                        }
                        ];
                        for (const notification of payload) {
                            const res = await uvCapitalApi.createNotifications(notification);
                            if (res.success) {
                                toast.success(`${notification.name} notification sent`);
                            } else {
                                toast.error(`${notification.name} notification failed`);
                            }
                        }
                    // setTimeout(() => {window.close()}, 2000)
                }else{
                    toast.warn('There is an issues in client conversion!');
                }
            }else{
                console.log(response);    
            }
        }catch(error){
            console.log(error)
            throw error;
        }
    }

    return (
        <Container className='d-flex justify-content-center align-items-center'>
            <Row className='w-75 mt-5'>
                <Col className='mt-5c'>
                    <Card>
                        <Card.Title>
                            <p className='text-center' style={{ fontSize: "80px", color: "var(--primary-color)" }}>Confirmation!</p>
                        </Card.Title>
                        <Card.Body>
                            <p className='text-center fw-bold fs-4'>You are Sure You Want to Confirm the Proposal?</p>
                            <Row>
                                <Col lg={12} className='d-flex justify-content-center'>
                                    <Button className='btn custom-btn-primary mx-2 btn-lg' onClick={clientConfirm}>Yes</Button>
                                    <Button className='btn custom-btn-secondary mx-2 btn-lg'>No</Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
        </Container>
    )
}

export default ClientConfirmation