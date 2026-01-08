'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Home,
  Building,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Address } from '@/lib/medusa';

interface AddressFormData {
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  address_2: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
}

const initialFormData: AddressFormData = {
  first_name: '',
  last_name: '',
  phone: '',
  address_1: '',
  address_2: '',
  city: '',
  province: 'Tamil Nadu',
  postal_code: '',
  country_code: 'in',
};

export default function AddressesPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, addAddress, updateAddress, deleteAddress } = useAuth();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.address_1.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.postal_code.trim()) {
      setError('Postal code is required');
      return false;
    }
    if (!/^\d{6}$/.test(formData.postal_code)) {
      setError('Please enter a valid 6-digit postal code');
      return false;
    }
    return true;
  };

  const handleAddAddress = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await addAddress(formData);
      setShowAddDialog(false);
      setFormData(initialFormData);
    } catch (err) {
      console.error('Failed to add address:', err);
      setError('Failed to add address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAddress = async () => {
    if (!editingAddress || !validateForm()) return;

    setIsSaving(true);
    try {
      await updateAddress(editingAddress.id, formData);
      setEditingAddress(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error('Failed to update address:', err);
      setError('Failed to update address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddressId) return;

    setIsSaving(true);
    try {
      await deleteAddress(deletingAddressId);
      setDeletingAddressId(null);
    } catch (err) {
      console.error('Failed to delete address:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (address: Address) => {
    setFormData({
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      phone: address.phone || '',
      address_1: address.address_1 || '',
      address_2: address.address_2 || '',
      city: address.city || '',
      province: address.province || 'Tamil Nadu',
      postal_code: address.postal_code || '',
      country_code: address.country_code || 'in',
    });
    setEditingAddress(address);
    setError('');
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingAddress(null);
    setFormData(initialFormData);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-6">
        <div className="bg-[#b18b5e]/5 border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-32 rounded-xs" />
          <Skeleton className="h-32 rounded-xs" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please login</h2>
          <p className="text-muted-foreground mb-6">Sign in to manage your addresses</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const addresses = customer?.addresses || customer?.shipping_addresses || [];

  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Header */}
      <div className="bg-[#b18b5e]/5 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#b18b5e] mb-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Saved Addresses</h1>
              <p className="text-sm text-muted-foreground">{addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No addresses saved</h2>
              <p className="text-muted-foreground mb-6">Add your first delivery address</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <Card key={address.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#b18b5e]/10 flex items-center justify-center shrink-0">
                      {index === 0 ? (
                        <Home className="h-5 w-5 text-[#b18b5e]" />
                      ) : (
                        <Building className="h-5 w-5 text-[#b18b5e]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {address.first_name} {address.last_name}
                        </span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      {address.phone && (
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                      )}
                      <p className="text-sm mt-1">{address.address_1}</p>
                      {address.address_2 && (
                        <p className="text-sm">{address.address_2}</p>
                      )}
                      <p className="text-sm">
                        {address.city}
                        {address.province && `, ${address.province}`}
                        {address.postal_code && ` - ${address.postal_code}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingAddressId(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Address Dialog */}
      <Dialog open={showAddDialog || !!editingAddress} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 rounded-xs bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  name="first_name"
                  placeholder="Rajesh"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  name="last_name"
                  placeholder="Kumar"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Address Line 1 *</label>
              <Input
                name="address_1"
                placeholder="House no, Street name"
                value={formData.address_1}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Address Line 2</label>
              <Input
                name="address_2"
                placeholder="Landmark, Area"
                value={formData.address_2}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">City *</label>
                <Input
                  name="city"
                  placeholder="Chennai"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Postal Code *</label>
                <Input
                  name="postal_code"
                  placeholder="600001"
                  value={formData.postal_code}
                  onChange={handleChange}
                  maxLength={6}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">State</label>
              <Input
                name="province"
                placeholder="Tamil Nadu"
                value={formData.province}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={editingAddress ? handleEditAddress : handleAddAddress}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editingAddress ? (
                'Update Address'
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAddressId} onOpenChange={() => setDeletingAddressId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
