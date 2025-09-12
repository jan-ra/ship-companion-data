'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Link, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Links, DataType } from '@/types';
import { EditModal } from '@/components/EditModal';

interface LinksEditorProps {
  data: Links;
  language: string;
  dataType: DataType;
  isComparison?: boolean;
  synchronizedMode?: boolean;
  showOnlyButtons?: boolean;
  showOnlyCard?: boolean;
  showEmptyState?: boolean;
  cardIndex?: number;
  validationResults?: {
    hasIncompleteTranslations: boolean;
    incompleteItems: Array<{ id: number; missingFields: string[] }>;
  };
}

export function LinksEditor({ 
  data, 
  language, 
  dataType, 
  isComparison = false,
  synchronizedMode = false,
  showOnlyButtons = false,
  showOnlyCard = false,
  showEmptyState = false,
  cardIndex,
  validationResults
}: LinksEditorProps) {
  const { updateData } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLinks, setEditingLinks] = useState<Links | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditingLinks({ ...data });
  };

  const handleSave = () => {
    if (editingLinks && !isComparison) {
      updateData(dataType, language as any, editingLinks);
      setIsEditing(false);
      setEditingLinks(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingLinks(null);
  };

  const renderEditModal = () => (
    <EditModal
      isOpen={isEditing}
      onClose={handleCancel}
      title="Edit Contact & Links"
      description="Manage contact information, social media links, and website URLs"
      size="full"
    >
      {editingLinks && (
        <div className="space-y-6 p-1">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={editingLinks.companyName}
                  onChange={(e) => setEditingLinks({ ...editingLinks, companyName: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Skipper Name</label>
                <Input
                  value={editingLinks.skipperName}
                  onChange={(e) => setEditingLinks({ ...editingLinks, skipperName: e.target.value })}
                  placeholder="Captain/Skipper name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Claim/Tagline</label>
              <Textarea
                value={editingLinks.claim}
                onChange={(e) => setEditingLinks({ ...editingLinks, claim: e.target.value })}
                placeholder="Company claim or tagline"
                className="min-h-20"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={editingLinks.phone}
                  onChange={(e) => setEditingLinks({ ...editingLinks, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={editingLinks.mail}
                  onChange={(e) => setEditingLinks({ ...editingLinks, mail: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instagram</label>
                <Input
                  value={editingLinks.instagram}
                  onChange={(e) => setEditingLinks({ ...editingLinks, instagram: e.target.value })}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Facebook</label>
                <Input
                  value={editingLinks.facebook}
                  onChange={(e) => setEditingLinks({ ...editingLinks, facebook: e.target.value })}
                  placeholder="https://facebook.com/page"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube</label>
                <Input
                  value={editingLinks.youtube}
                  onChange={(e) => setEditingLinks({ ...editingLinks, youtube: e.target.value })}
                  placeholder="https://youtube.com/channel"
                />
              </div>
            </div>
          </div>

          {/* Legacy Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Legacy Links (Deprecated)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">History Link</label>
                <Input
                  value={editingLinks.historyLink}
                  onChange={(e) => setEditingLinks({ ...editingLinks, historyLink: e.target.value })}
                  placeholder="https://history.link"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fact Link</label>
                <Input
                  value={editingLinks.factLink}
                  onChange={(e) => setEditingLinks({ ...editingLinks, factLink: e.target.value })}
                  placeholder="https://facts.link"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Booking Link</label>
                <Input
                  value={editingLinks.bookingLink}
                  onChange={(e) => setEditingLinks({ ...editingLinks, bookingLink: e.target.value })}
                  placeholder="https://booking.link"
                />
              </div>
            </div>
          </div>

          {/* Current Links Object */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Current Links Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">History</label>
                <Input
                  value={editingLinks.links.history}
                  onChange={(e) => setEditingLinks({ 
                    ...editingLinks, 
                    links: { ...editingLinks.links, history: e.target.value }
                  })}
                  placeholder="https://history.page"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ship Facts</label>
                <Input
                  value={editingLinks.links.shipfacts}
                  onChange={(e) => setEditingLinks({ 
                    ...editingLinks, 
                    links: { ...editingLinks.links, shipfacts: e.target.value }
                  })}
                  placeholder="https://shipfacts.page"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Booking</label>
                <Input
                  value={editingLinks.links.booking}
                  onChange={(e) => setEditingLinks({ 
                    ...editingLinks, 
                    links: { ...editingLinks.links, booking: e.target.value }
                  })}
                  placeholder="https://booking.page"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Privacy</label>
                <Input
                  value={editingLinks.links.privacy}
                  onChange={(e) => setEditingLinks({ 
                    ...editingLinks, 
                    links: { ...editingLinks.links, privacy: e.target.value }
                  })}
                  placeholder="https://privacy.page"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Materials</label>
                <Input
                  value={editingLinks.links.materials}
                  onChange={(e) => setEditingLinks({ 
                    ...editingLinks, 
                    links: { ...editingLinks.links, materials: e.target.value }
                  })}
                  placeholder="https://materials.page"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Links
            </Button>
          </div>
        </div>
      )}
    </EditModal>
  );

  // Render only buttons for synchronized mode
  if (showOnlyButtons) {
    return (
      <>
        {renderEditModal()}
        {/* Edit button hidden per requirements */}
        {false && !isComparison ? (
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Links
          </Button>
        ) : null}
      </>
    );
  }

  // Render only a specific card for synchronized mode (Links is single object, so cardIndex is ignored)
  if (showOnlyCard) {
    return (
      <>
        {renderEditModal()}
        <Card className={isComparison ? 'bg-muted/20 h-full flex flex-col' : 'h-full flex flex-col'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  {data.companyName || 'Company Links'}
                </CardTitle>
                <CardDescription>
                  Contact & Social Media Information
                </CardDescription>
              </div>
              {!isComparison && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {data.skipperName && (
                <div>
                  <span className="text-sm font-medium">Skipper: </span>
                  <span className="text-sm">{data.skipperName}</span>
                </div>
              )}
              
              {data.claim && (
                <div>
                  <span className="text-sm font-medium">Claim: </span>
                  <span className="text-sm">{data.claim}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 pt-2">
                {data.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3" />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.mail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3" />
                    <span>{data.mail}</span>
                  </div>
                )}
                {data.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="w-3 h-3" />
                    <span>Instagram</span>
                  </div>
                )}
                {data.facebook && (
                  <div className="flex items-center gap-2 text-sm">
                    <Facebook className="w-3 h-3" />
                    <span>Facebook</span>
                  </div>
                )}
                {data.youtube && (
                  <div className="flex items-center gap-2 text-sm">
                    <Youtube className="w-3 h-3" />
                    <span>YouTube</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Render empty state for synchronized mode
  if (showEmptyState) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No links configuration available</p>
        </CardContent>
      </Card>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {/* Edit button hidden per requirements */}
          {false && !isComparison && (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Links
            </Button>
          )}
        </div>

        <Card className={isComparison ? 'bg-muted/20' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  {data.companyName || 'Company Links'}
                </CardTitle>
                <CardDescription>
                  Contact & Social Media Information
                </CardDescription>
              </div>
              {!isComparison && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.skipperName && (
                <div>
                  <span className="text-sm font-medium">Skipper: </span>
                  <span className="text-sm">{data.skipperName}</span>
                </div>
              )}
              
              {data.claim && (
                <div>
                  <span className="text-sm font-medium">Claim: </span>
                  <span className="text-sm">{data.claim}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {data.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3" />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.mail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3" />
                    <span>{data.mail}</span>
                  </div>
                )}
                {data.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="w-3 h-3" />
                    <span>Instagram</span>
                  </div>
                )}
                {data.facebook && (
                  <div className="flex items-center gap-2 text-sm">
                    <Facebook className="w-3 h-3" />
                    <span>Facebook</span>
                  </div>
                )}
                {data.youtube && (
                  <div className="flex items-center gap-2 text-sm">
                    <Youtube className="w-3 h-3" />
                    <span>YouTube</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}