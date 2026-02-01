// schemas/chapter.js
export default {
  name: 'chapter',
  title: 'Chapter',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'Chapter ID',
      type: 'number',
      description: 'Used for sorting (e.g., 1, 2, 3)',
      validation: Rule => Rule.required().integer()
    },
    {
      name: 'title',
      title: 'Chapter Title',
      type: 'string',
      description: 'e.g., "Chapter 1: The Beginning"'
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'e.g., "The First Meeting"'
    },
    {
      name: 'content',
      title: 'Story Content',
      type: 'text',
      rows: 15,
      description: 'Paste your story here. Use **bold** for bold, *italics* for italics, and > at the start of a line for quotes.'
    }
  ],
  orderings: [
    {
      title: 'Chapter ID Asc',
      name: 'idAsc',
      by: [
        {field: 'id', direction: 'asc'}
      ]
    }
  ]
}
