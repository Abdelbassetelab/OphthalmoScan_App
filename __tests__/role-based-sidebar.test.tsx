/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleBasedSidebar from '@/components/layouts/role-based-sidebar';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock the role-switcher component
jest.mock('../components/role-switcher', () => {
  return function MockRoleSwitcher() {
    return <div data-testid="role-switcher">Role Switcher</div>;
  };
});

describe('RoleBasedSidebar', () => {
  it('renders the correct menu items for patient role', () => {
    render(<RoleBasedSidebar userRole="patient" />);
    
    // Check for patient-specific menu items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Scans')).toBeInTheDocument();
    expect(screen.getByText('Scan Analysis')).toBeInTheDocument();
    expect(screen.getByText('My Health')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    
    // Check that admin/doctor-specific items aren't shown
    expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    expect(screen.queryByText('Patient Management')).not.toBeInTheDocument();
    expect(screen.queryByText('Model Generation')).not.toBeInTheDocument();
  });
  
  it('renders the correct menu items for doctor role', () => {
    render(<RoleBasedSidebar userRole="doctor" />);
    
    // Check for doctor-specific menu items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Scans')).toBeInTheDocument();
    expect(screen.getByText('Scan Analysis')).toBeInTheDocument();
    expect(screen.getByText('Patient Management')).toBeInTheDocument();
    expect(screen.getByText('Diagnosis')).toBeInTheDocument();
    expect(screen.getByText('Model Testing')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    
    // Check that admin/patient-specific items aren't shown
    expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    expect(screen.queryByText('My Health')).not.toBeInTheDocument();
    expect(screen.queryByText('Model Generation')).not.toBeInTheDocument();
  });
  
  it('renders the correct menu items for admin role', () => {
    render(<RoleBasedSidebar userRole="admin" />);
    
    // Check for admin-specific menu items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Management')).toBeInTheDocument();
    expect(screen.getByText('All Scans')).toBeInTheDocument();
    expect(screen.getByText('Model Testing')).toBeInTheDocument();
    expect(screen.getByText('Model Generation')).toBeInTheDocument();
    expect(screen.getByText('Scan Analysis')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    
    // Check that doctor/patient-specific items aren't shown
    expect(screen.queryByText('My Health')).not.toBeInTheDocument();
    expect(screen.queryByText('Patient Management')).not.toBeInTheDocument();
  });
  
  it('collapses the sidebar when toggle button is clicked', () => {
    const { container } = render(<RoleBasedSidebar userRole="patient" />);
    
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleButton).toBeInTheDocument();
    
    // Initial state - not collapsed
    expect(container.firstChild).toHaveClass('w-64');
    expect(container.firstChild).not.toHaveClass('w-20');
    
    // Click the toggle button
    fireEvent.click(toggleButton);
    
    // After click - collapsed
    expect(container.firstChild).not.toHaveClass('w-64');
    expect(container.firstChild).toHaveClass('w-20');
  });
});
