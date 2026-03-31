import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const demosTable = pgTable('demos', {
  id: text('id').primaryKey(),
  shareId: text('share_id').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('draft'),
  brandColor: text('brand_color').default('#4461F2'),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  userId: text('user_id')
});

export const stepsTable = pgTable('steps', {
  id: text('id').primaryKey(),
  demoId: text('demo_id').references(() => demosTable.id).notNull(),
  orderIndex: integer('order_index').notNull(),
  stepType: text('step_type').notNull(), // intro, normal, success, end
  title: text('title').notNull(),
  description: text('description'),
  leftPanelType: text('left_panel_type').notNull(), // none, browser, iphone, macbook
  rightPanelType: text('right_panel_type'), // none, code, api
  codeLanguage: text('code_language'),
  codeContent: text('code_content'),
  successMessage: text('success_message'),
  apiStatusCode: integer('api_status_code'),
  apiResponseMs: integer('api_response_ms'),
  createdAt: timestamp('created_at').defaultNow()
});

export const templatesTable = pgTable('templates', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  config: jsonb('config')
});

export const demoRelations = relations(demosTable, ({ many }) => ({
  steps: many(stepsTable)
}));

export const stepRelations = relations(stepsTable, ({ one }) => ({
  demo: one(demosTable, {
    fields: [stepsTable.demoId],
    references: [demosTable.id]
  })
}));
