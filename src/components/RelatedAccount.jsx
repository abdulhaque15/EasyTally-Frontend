import React from 'react'
import { Card, Col, Table } from 'react-bootstrap'
import { MdDelete } from 'react-icons/md'
import { useNavigate } from 'react-router-dom';

const RelatedAccount = ({ accountList = [] }) => {
  const navigate = useNavigate();

//   const handleDelete = (id) => {
//     console.log('Delete account with ID:', id);
//     // TODO: API call for delete
//   };

  if (!accountList.length) {
    return <p>No Records Found!</p>;
  }

  return (
    <Table hover responsive>
      <thead>
        <tr>
          <th>Sr.</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Type</th>
          <th>Website</th>
          {/* <th>Action</th> */}
        </tr>
      </thead>
      <tbody>
        {accountList?.map((account, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>
              <span
                className="text-primary text-decoration-underline icon-default"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/account/view/${account?.id}`)}
              >
                {account?.name || ''}
              </span>
            </td>
            <td>{account?.email || ''}</td>
            <td>{account?.phone || ''}</td>
            <td>{account?.type || ''}</td>
            <td>{account?.website || ''}</td>
            {/* <td>
              <MdDelete
                className="text-danger icon-default"
                style={{ cursor: 'pointer' }}
                onClick={() => handleDelete(account?.id)}
              />
            </td> */}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RelatedAccount;


// import React from 'react'
// import { Card, Col } from 'react-bootstrap'
// import { MdDelete } from 'react-icons/md'

// const RelatedAccount = ( { account } ) => {
//     return (
//     <Card className="h-100 text-start w-100 p-0 holographic-card position-relative">
//         <MdDelete className="fs-5 text-danger position-absolute top-0 end-0 m-2 icon-default" />
//         <Card.Body className="d-flex flex-column gap-1">
//             <span>
//                 <strong>Name:</strong>{" "}
//                 <span
//                     className="text-decoration-underline text-primary icon-default"
//                     style={{ cursor: "pointer" }}
//                     onClick={() => navigate(`/projects/view/${account?.id}`)}
//                 >
//                     {account?.name}
//                 </span>
//             </span>
//             <span>
//                 <strong>Stage:</strong>{" "}
//                 {account?.stage}
//             </span>
//             <span>
//                 <strong>Total Amount:</strong>{" "}
//                 {account?.total_amount}
//             </span>
//         </Card.Body>
//     </Card>
    
//     )
// }

// export default RelatedAccount