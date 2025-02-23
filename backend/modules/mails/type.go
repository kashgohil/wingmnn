package mails

// @common_fields
type Mail struct {
	ID           string
	Subject      string
	Body         string
	SenderID     string
	RecipientIDs []string
	CcIDs        []string
	BccIDs       []string
	Attachments  []string
}
