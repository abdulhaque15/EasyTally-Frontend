import { Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const RelatedContact = ({ contactList = [] }) => {
  const navigate = useNavigate(); 
  if (!contactList.length) {
    return <p>No Records Found!</p>;
  }

  return (
    <Table hover responsive>
      <thead>
        <tr>
          <th>Sr.</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Created Date</th>
          {/* <th>Action</th> */}
        </tr>
      </thead>
      <tbody>
        {contactList?.map((contact, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>
              {console.log('contact' , contact)}
              <span
                className="text-primary text-decoration-underline icon-default"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/contact/view/${contact?.id}`)}
              >
                {contact?.first_name || ''}
              </span>
            </td>
            <td>{contact?.last_name || ''}</td>
            <td>{contact?.email || ''}</td>
            <td>{contact?.phone || ''}</td>
            <td>{contact?.createddate || ''}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RelatedContact;
