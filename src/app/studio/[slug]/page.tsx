'use client';

import { use, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setDraftPage, updateSectionProp } from '@/store/slices/draftPageSlice';
import { setActiveSection } from '@/store/slices/uiSlice';
import { fetchPageData } from '@/lib/contentfulClient';
import { renderSection } from '@/lib/sectionRegistry';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { publishDraft } from '@/app/actions/publish';
import { publishStart, publishSuccess, publishFail } from '@/store/slices/publishSlice';

export default function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const dispatch = useDispatch();
  
  const page = useSelector((state: RootState) => state.draftPage.page);
  const activeSectionId = useSelector((state: RootState) => state.ui.activeSectionId);
  const role = useSelector((state: RootState) => state.ui.role);
  const publishState = useSelector((state: RootState) => state.publish);
  
  useEffect(() => {
    fetchPageData(slug, true).then((data) => {
      if (data) dispatch(setDraftPage(data));
    });
  }, [slug, dispatch]);

  if (!page) return <div className="p-8">Loading studio...</div>;

  const activeSection = page.sections.find(s => s.id === activeSectionId);

  const handlePropChange = (propKey: string, value: string) => {
    if (activeSectionId) {
      dispatch(updateSectionProp({ sectionId: activeSectionId, propKey, value }));
    }
  };

  const handlePublish = async () => {
    if (!page || role !== 'publisher') return;
    dispatch(publishStart());
    try {
      const res = await publishDraft(page, role);
      if (res.success && res.version) {
        dispatch(publishSuccess(res.version));
        alert(`Published version ${res.version} (${res.bumpType} bump)`);
      } else {
        dispatch(publishFail());
        alert(`Publish failed: ${res.error}`);
      }
    } catch (e) {
      dispatch(publishFail());
      alert('Error during publish');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Editor */}
      <aside className="w-80 bg-white border-r flex flex-col overflow-y-auto shadow-sm z-10">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold truncate">Studio: {page.title}</h2>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">Role: <span className="font-semibold text-blue-600">{role}</span></p>
            {role === 'publisher' && (
              <button 
                onClick={handlePublish}
                disabled={publishState.isPublishing}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded shadow disabled:opacity-50"
              >
                {publishState.isPublishing ? 'Publishing...' : 'Publish'}
              </button>
            )}
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {!activeSectionId ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sections</h3>
              <div className="space-y-2">
                {page.sections.map(section => (
                  <div 
                    key={section.id} 
                    onClick={() => dispatch(setActiveSection(section.id))}
                    className="p-3 border rounded-md bg-white shadow-sm hover:border-blue-400 cursor-pointer transition flex justify-between items-center"
                  >
                    <span className="font-semibold capitalize text-sm">{section.type}</span>
                    <span className="text-gray-400 text-xs">Edit</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => dispatch(setActiveSection(null))}
                className="text-sm text-blue-600 hover:underline mb-4 block"
              >
                &larr; Back to Sections
              </button>
              
              <h3 className="font-bold text-lg capitalize border-b pb-2">{activeSection?.type} Props</h3>
              
              <div className="space-y-4">
                {activeSection?.type === 'hero' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        value={(activeSection.props.title as string) || ''} 
                        onChange={(e) => handlePropChange('title', e.target.value)} 
                        disabled={role === 'viewer'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input 
                        id="subtitle" 
                        value={(activeSection.props.subtitle as string) || ''} 
                        onChange={(e) => handlePropChange('subtitle', e.target.value)} 
                        disabled={role === 'viewer'}
                      />
                    </div>
                  </>
                )}
                
                {activeSection?.type === 'cta' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="label">Button Label</Label>
                      <Input 
                        id="label" 
                        value={(activeSection.props.label as string) || ''} 
                        onChange={(e) => handlePropChange('label', e.target.value)} 
                        disabled={role === 'viewer'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="url">Target URL</Label>
                      <Input 
                        id="url" 
                        value={(activeSection.props.url as string) || ''} 
                        onChange={(e) => handlePropChange('url', e.target.value)} 
                        disabled={role === 'viewer'}
                      />
                    </div>
                  </>
                )}
                
                {activeSection?.type === 'testimonial' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="quote">Quote</Label>
                      <Input 
                        id="quote" 
                        value={(activeSection.props.quote as string) || ''} 
                        onChange={(e) => handlePropChange('quote', e.target.value)} 
                        disabled={role === 'viewer'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="author">Author</Label>
                      <Input 
                        id="author" 
                        value={(activeSection.props.author as string) || ''} 
                        onChange={(e) => handlePropChange('author', e.target.value)} 
                        disabled={role === 'viewer'}
                      />
                    </div>
                  </>
                )}

                {activeSection?.type === 'featureGrid' && (
                  <div className="space-y-1">
                    <Label htmlFor="features">Features (comma separated)</Label>
                    <Input 
                      id="features" 
                      value={((activeSection.props.features as string[]) || []).join(', ')} 
                      onChange={(e) => handlePropChange('features', e.target.value.split(',').map(s => s.trim()))} 
                      disabled={role === 'viewer'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 overflow-y-auto bg-gray-200 p-8 flex justify-center">
        <div className="bg-white min-h-[800px] w-full max-w-5xl shadow-lg ring-1 ring-black/5 overflow-hidden transition-all">
          {page.sections.map(section => (
            <div 
              key={section.id} 
              className={`relative ${activeSectionId === section.id ? 'ring-2 ring-blue-500 ring-inset' : 'hover:ring-2 hover:ring-blue-300 hover:ring-inset'}`}
              onClick={() => dispatch(setActiveSection(section.id))}
            >
              {renderSection(section)}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
