import React from 'react';
import { Card, Image, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';


const ProfileCard = () => {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Card className="shadow-sm">
            <Card.Body className="text-center p-4">
              {/* Profile Image - Replace with your actual image */}
              <div className="mb-3">
                <Image 
                  src="https://via.placeholder.com/150" 
                  roundedCircle 
                  width={120}
                  height={120}
                  className="border border-3 border-primary"
                  alt="Profile"
                />
              </div>
              
              {/* Profile Info */}
              <h3 className="mb-1">Anirudh Sharma</h3>
              <p className="text-muted mb-3">Admin</p>
              
              {/* Edit Profile Button */}
              <Button variant="outline-primary" className="px-4">
                Edit Profile
              </Button>
              
              {/* Additional Info (optional) */}
              <div className="mt-4 text-start">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Email:</span>
                  <span>anirudh@example.com</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Joined:</span>
                  <span>January 2023</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  );
};
