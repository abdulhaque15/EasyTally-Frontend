import { Badge, Image } from 'react-bootstrap';

const UserRolePill = ({ profileImageUrl, role }) => {
  return (
    <Badge
      pill
      bg="primary"
      className="d-inline-flex align-items-center px-3 py-2"
      style={{ fontSize: '0.9rem' }}
    >
      <Image
        src={}
        roundedCircle
        width="32"
        height="32"
        className="me-2"
        alt="User Profile"
      />
      {role}
    </Badge>
  );
};

export default UserRolePill;
