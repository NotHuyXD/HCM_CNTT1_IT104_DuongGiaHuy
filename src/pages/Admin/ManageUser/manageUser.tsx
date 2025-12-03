/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import axios from 'axios';
// XÓA: import './UserManagement.css'; 

// Mock Interface
interface UserType {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    status: boolean;
}

const USERS_PER_PAGE = 5;
// Sử dụng biến môi trường VITE_SV_HOST
const API_URL = `${import.meta.env.VITE_SV_HOST}/users`; 

// --- Sub-Components: Modals ---

// Modal Chỉnh sửa người dùng
function EditUserModal({ isOpen, user, onClose, loadUsers }: { isOpen: boolean, user: UserType | null, onClose: () => void, loadUsers: () => void }) {
    const [formData, setFormData] = useState(user || {} as UserType);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(user);
            setError('');
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? newValue : value
        }));
    };

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.username.trim() === '') {
            setError("Username không được để trống.");
            return;
        }

        try {
            // THAY THẾ bằng API PATCH/PUT thực tế: 
            // await axios.patch(`${API_URL}/${formData.id}`, formData);
            
            // --- Mô phỏng API call thành công ---
            console.log(`[API MOCK] Đã gửi PATCH/PUT cho user ${formData.id}:`, formData);
            // ------------------------------------
            
            loadUsers(); // Tải lại danh sách sau khi chỉnh sửa
            onClose();
        } catch (error) {
            console.error("Lỗi khi chỉnh sửa người dùng:", error);
            setError("Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="modal-backdrop">
            <form className="modal-content" onSubmit={handleEditSubmit}>
                <h3>Chỉnh Sửa Người Dùng: {user.username}</h3>
                <div className="form-group">
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                {/* Ẩn field Role, chỉ hiển thị status */}
                <div className="form-group checkbox-group">
                    <label>Active Status</label>
                    <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} />
                </div>
                
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                
                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="cancel-button">Hủy</button>
                    <button type="submit" className="save-button">Lưu Thay Đổi</button>
                </div>
            </form>
        </div>
    );
}

// Modal Xóa người dùng
function DeleteUserModal({ isOpen, user, onClose, loadUsers }: { isOpen: boolean, user: UserType | null, onClose: () => void, loadUsers: () => void }) {
    const [error, setError] = useState('');

    const handleDeleteConfirm = async () => {
        if (!user) return;
        setError('');

        try {
            // THAY THẾ bằng API DELETE thực tế: 
            // await axios.delete(`${API_URL}/${user.id}`);
            
            // --- Mô phỏng API call thành công ---
            console.log(`[API MOCK] Đã xóa DELETE user ${user.id}`);
            // ------------------------------------
            
            loadUsers(); // Tải lại danh sách người dùng
            onClose();
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            setError("Lỗi khi xóa dữ liệu. Vui lòng thử lại.");
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content delete-modal">
                <h3>Xác nhận xóa</h3>
                <p>Bạn có chắc chắn muốn xóa người dùng **{user.username}** không? Thao tác này không thể hoàn tác.</p>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                    <button type="button" onClick={onClose} className="cancel-button">Hủy</button>
                    <button type="button" onClick={handleDeleteConfirm} className="delete-button">Xóa</button>
                </div>
            </div>
        </div>
    );
}


// --- Main Component ---
export default function UserManagement() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL);
            setUsers(response.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu người dùng:", error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // CẬP NHẬT LOGIC LỌC: 1. CHỈ HIỂN THỊ USERS (role === 'user') & 2. ÁP DỤNG TÌM KIẾM
    const filteredUsers = useMemo(() => {
        // 1. Lọc bỏ admin, chỉ giữ lại user
        const nonAdminUsers = users.filter(user => user.role.toLowerCase() === 'user');

        // 2. Áp dụng tìm kiếm
        if (!searchTerm) return nonAdminUsers;
        
        return nonAdminUsers.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    };

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    // Handlers mở modal
    const openEditModal = (user: UserType) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user: UserType) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    // Handlers đóng modal chung
    const closeModal = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="pagination-controls">
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &laquo; Previous
                </button>
                {pages}
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Next &raquo;
                </button>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="user-management-container">
                <div className="loading-state">
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...
                </div>
            </div>
        );
    }

    return (
        <div className="user-management-container">
            <style>
                {`
                .user-management-container {
                    padding: 2rem;
                    width: 100%;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    border-radius: 12px;
                    background-color: #f7f9fc;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 1rem;
                }

                .header h2 {
                    color: #1f2937;
                    font-size: 1.75rem;
                    font-weight: 700;
                }

                .search-bar {
                    flex-grow: 1;
                    margin-right: 1rem;
                    display: flex;
                    justify-content: flex-end;
                }

                .search-input {
                    padding: 0.75rem 1rem;
                    width: 100%;
                    max-width: 300px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: border-color 0.2s;
                }
                
                .search-input:focus {
                    border-color: #3b82f6;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
                }

                .user-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    background-color: #ffffff;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .user-table th, .user-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid #f3f4f6;
                }

                .user-table th {
                    background-color: #eef2ff; /* Màu nền cho header */
                    font-weight: 600;
                    color: #374151;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                }

                .user-table tr:hover {
                    background-color: #f9fafb;
                }

                .user-table tr:last-child td {
                    border-bottom: none;
                }

                .status-badge {
                    padding: 0.3rem 0.6rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-align: center;
                    display: inline-block;
                    min-width: 70px;
                }

                .status-active {
                    background-color: #d1fae5;
                    color: #059669;
                }

                .status-inactive {
                    background-color: #fecaca;
                    color: #dc2626;
                }

                .role-admin {
                    color: #1d4ed8;
                    font-weight: 700;
                }
                .role-user {
                    color: #6b7280;
                }
                
                .action-button {
                    background: none;
                    border: none;
                    padding: 0.5rem;
                    cursor: pointer;
                    transition: color 0.2s;
                    font-size: 0.9rem;
                    font-weight: 500;
                    border-radius: 6px;
                }

                .action-button:hover {
                    background-color: #e5e7eb;
                }
                
                .pagination-controls {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 1.5rem;
                    gap: 0.5rem;
                }

                .pagination-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    background-color: #ffffff;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                    color: #4b5563;
                }

                .pagination-button:hover:not(:disabled):not(.active) {
                    background-color: #f3f4f6;
                    border-color: #a1a1aa;
                }

                .pagination-button.active {
                    background-color: #1e40af; 
                    color: white;
                    border-color: #1e40af;
                }

                .pagination-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }
                
                .loading-state {
                    text-align: center;
                    padding: 2rem;
                    font-size: 1.2rem;
                    color: #6b7280;
                }

                .loading-state i {
                    margin-right: 10px;
                }
                
                /* Modal Styles */
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    width: 100%;
                    max-width: 450px;
                }
                
                .modal-content h3 {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                    color: #1f2937;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 0.5rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.3rem;
                    font-weight: 600;
                    color: #374151;
                }
                
                .form-group input, .form-content select {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                }
                
                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .checkbox-group input {
                    width: auto;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 1.5rem;
                }

                .save-button, .cancel-button, .delete-button {
                    padding: 0.75rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: background-color 0.2s;
                    border: none;
                }

                .save-button {
                    background-color: #3b82f6;
                    color: white;
                }
                
                .save-button:hover {
                    background-color: #2563eb;
                }

                .cancel-button {
                    background-color: #e5e7eb;
                    color: #374151;
                }
                
                .cancel-button:hover {
                    background-color: #d1d5db;
                }

                .delete-modal {
                    text-align: center;
                }
                
                .delete-modal p {
                    margin-bottom: 1.5rem;
                    color: #4b5563;
                }
                
                .delete-button {
                    background-color: #ef4444;
                    color: white;
                }
                
                .delete-button:hover {
                    background-color: #dc2626;
                }
                `}
            </style>
            
            <div className="header">
                <h2><i className="fa-solid fa-users"></i> Quản lý Người dùng</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo username..."
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status ? 'status-active' : 'status-inactive'}`}>
                                        {user.status ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className="action-button"
                                        style={{ color: '#3b82f6', marginRight: '5px' }}
                                        onClick={() => openEditModal(user)}
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i> Sửa
                                    </button>
                                    <button 
                                        className="action-button"
                                        style={{ color: '#ef4444' }}
                                        onClick={() => openDeleteModal(user)}
                                    >
                                        <i className="fa-solid fa-trash"></i> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                                Không tìm thấy người dùng nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Phân trang */}
            {totalPages > 1 && filteredUsers.length > 0 && renderPagination()}
            
            {/* Modals */}
            <EditUserModal 
                isOpen={isEditModalOpen}
                user={selectedUser}
                onClose={closeModal}
                loadUsers={loadUsers}
            />
            
            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                user={selectedUser}
                onClose={closeModal}
                loadUsers={loadUsers}
            />
        </div>
    );
}