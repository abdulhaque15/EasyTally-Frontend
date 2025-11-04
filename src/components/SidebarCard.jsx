import { Button, Container } from "react-bootstrap"
import { useNavigate } from 'react-router-dom';
import { useAuthWrapper } from "../helper/AuthWrapper"
import EditProfileModal from "./EditProfile";

const SidebarCard = ({showModal , setShowModal}) => {
    const navigate = useNavigate();
    const { user } = useAuthWrapper();
    return (
        <Container fluid className="user-details border-bottom-2 text-center p-3">
            <div className="details">
                <img src={user?.file_name} className="user-profile img-fluid img-responsive" />
                {/* <h4>{user?.name || "Guest"}</h4>
                <div className="lead fs-6">{user?.role_name || "User"}</div> */}
            </div>
            {/* <Button className='w-50 custom-btn-primary' onClick={() => setShowModal(true)}>Edit Profile</Button>
            <EditProfileModal show={showModal} onHide={() => setShowModal(false)} /> */}
        </Container>

    )
}

export default SidebarCard;