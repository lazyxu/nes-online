package mailer

import (
	"gopkg.in/gomail.v1"
	"github.com/MeteorKL/nes-online/util/config"
)

// SendToMail http://blog.csdn.net/u012210379/article/details/44224497
func Send(to, subject, body, mailtype string) error {
	user := config.Conf.Mail.User
	password := config.Conf.Mail.Password
	host := config.Conf.Mail.Host
	port := config.Conf.Mail.Port
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
