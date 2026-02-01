export default {
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'e.g., "First Coffee Date"'
    },
    {
      name: 'date',
      title: 'Date Taken',
      type: 'date'
    },
    {
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}