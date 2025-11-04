import React, { useState, useRef } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FaWindowClose, FaPaperclip } from "react-icons/fa";
import toast  from 'react-hot-toast';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontSize from "@tiptap/extension-font-size";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import uvCapitalApi from "../api/uvCapitalApi";
import Dropdown from "react-bootstrap/Dropdown";
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdFormatColorText,
  MdHighlight,
} from "react-icons/md";

const EmailModal = ({
  selectedRows,
  show,
  onHide,
  type = "",
  setRefreshTable,
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const textColorInputRef = useRef(null);
  const highlightColorInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize.configure({ types: ["textStyle"] }),
      FontFamily.configure({ types: ["textStyle"] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
  });

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const handleSendEmail = async () => {
    const html = editor?.getHTML();
    if (!to || !subject || !html || html.trim() === "<p></p>") {
      toast.warning("Please fill all fields before sending.");
      return;
    }
    const formData = new FormData();
    formData.append("to", to);
    formData.append("ccAddress", cc);
    formData.append("bccAddress", bcc);
    formData.append("subject", subject);
    formData.append("body", html);
    formData.append("type", type || "general");
    selectedRows?.forEach((row) => {
      formData.append("ids[]", row?.id);
    });

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });
    try {
      setSending(true);
      const res = await uvCapitalApi.sendEmail(formData);
      if (res.success) {
        toast.success("Email sent successfully.");
        onHide();
        setTo("");
        setCc("");
        setBcc("");
        setSubject("");
        setAttachments([]);
        editor?.commands.setContent("");
        setRefreshTable?.(true);
      } else {
        toast.error(res.message || "Failed to send email.");
      }
    } catch (error) {
      console.error("Error while sending email:", error);
      toast.error("Something went wrong while sending the email.");
    } finally {
      setSending(false);
    }
  };

  const renderToolbar = () => (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
      <Button
        size="sm"
        variant="light"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <b>B</b>
      </Button>
      <Button
        size="sm"
        variant="light"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <i>I</i>
      </Button>
      <Button
        size="sm"
        variant="light"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <u>U</u>
      </Button>
      <Dropdown title="Text Alignment">
        <Dropdown.Toggle
          variant="light"
          size="sm"
          id="dropdown-basic"
          title="Align"
        >
          <MdFormatAlignLeft />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <MdFormatAlignLeft /> Left
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <MdFormatAlignCenter /> Center
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <MdFormatAlignRight /> Right
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
          >
            <MdFormatAlignJustify /> Justify
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Form.Select
        size="sm"
        style={{ width: 100 }}
        onChange={(e) =>
          editor.chain().focus().setFontSize(e.target.value).run()
        }
        defaultValue=""
        title="Font Size"
      >
        <option value="">Font Size</option>
        <option value="12px">Small</option>
        <option value="16px">Normal</option>
        <option value="20px">Large</option>
        <option value="24px">X-Large</option>
      </Form.Select>
      <Form.Select
        size="sm"
        style={{ width: 140 }}
        onChange={(e) =>
          editor.chain().focus().setFontFamily(e.target.value).run()
        }
        defaultValue=""
        title="Font Family"
      >
        <option value="">Font Family</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times</option>
        <option value="Courier New">Monospace</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </Form.Select>
      <Button
        size="sm"
        variant="light"
        title="Attach File"
        onClick={() => fileInputRef.current?.click()}
      >
        <FaPaperclip />
      </Button>
      <Form.Control
        type="file"
        ref={fileInputRef}
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Button
        size="sm"
        variant="light"
        title="Text Color"
        className="p-1"
        onClick={() => textColorInputRef.current?.click()}
      >
        <MdFormatColorText size={18} />
      </Button>
      <Form.Control
        type="color"
        ref={textColorInputRef}
        style={{ display: "none" }}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
      />
      <Button
        size="sm"
        variant="light"
        title="Highlight Color"
        className="p-1"
        onClick={() => highlightColorInputRef.current?.click()}
      >
        <MdHighlight size={18} />
      </Button>
      <Form.Control
        type="color"
        ref={highlightColorInputRef}
        style={{ display: "none" }}
        onChange={(e) =>
          editor.chain().focus().setHighlight({ color: e.target.value }).run()
        }
      />
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header>
        <Modal.Title>Send Email</Modal.Title>
        <FaWindowClose
          onClick={onHide}
          className="ms-auto fs-5 icon-default"
          style={{ cursor: "pointer" }}
        />
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Label>To</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter recipient email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </Col>
            <Col>
              <Form.Label>CC</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter CC email(s)"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Label>BCC</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter BCC email(s)"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
              />
            </Col>
            <Col>
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Col>
          </Row>
          <Form.Label>Message</Form.Label>
          {editor && renderToolbar()}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              minHeight: "250px",
              backgroundColor: "#fff",
            }}
          >
            <EditorContent editor={editor} />
          </div>
          {attachments?.length > 0 && (
            <div className="mt-2">
              <strong>Attached Files:</strong>
              <ul className="mb-0 list-unstyled">
                {attachments?.map((file, idx) => (
                  <li key={idx} className="d-flex align-items-center gap-2">
                    <span>{file.name}</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        const newFiles = [...attachments];
                        newFiles.splice(idx, 1);
                        setAttachments(newFiles);
                      }}
                    >
                      ❌
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
          className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
          type="submit"
          onClick={handleSendEmail}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmailModal;
