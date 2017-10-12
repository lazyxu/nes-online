package router

import (
	"gopkg.in/gomail.v1"
)

// SendToMail http://blog.csdn.net/u012210379/article/details/44224497
func SendToMail(to, subject, body, mailtype string) error {
	user := config.Mail.User
	password := config.Mail.Password
	host := config.Mail.Host
	port := config.Mail.Port
	msg := gomail.NewMessage()
	msg.SetHeader("From", user)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody(mailtype, body)
	mailer := gomail.NewMailer(host, user, password, port)
	if err := mailer.Send(msg); err != nil {
		return err
	}
	return nil
}
