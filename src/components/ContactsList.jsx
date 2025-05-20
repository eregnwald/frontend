import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai'; // Иконки для редактирования и удаления

function ContactsList () {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/contacts');
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    fetchContacts();
  }, []);

  const handleEdit = (contactId) => {
    // Перейти на страницу редактирования контакта
    window.location.href = `/contacts/edit/${contactId}`;
  };

  const handleDelete = async (contactId) => {
    try {
      await axios.delete(`/api/contacts/${contactId}`);
      setContacts(contacts.filter((contact) => contact.contact_id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <div>
      <h2>Contacts List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.contact_id}>
              <td>{`${contact.first_name} ${contact.last_name}`}</td>
              <td>{contact.email}</td>
              <td>
                <button onClick={() => handleEdit(contact.contact_id)}>
                  <AiFillEdit /> Edit
                </button>
                <button onClick={() => handleDelete(contact.contact_id)}>
                  <AiFillDelete /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsList;