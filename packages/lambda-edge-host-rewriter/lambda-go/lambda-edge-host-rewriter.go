package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/lambda"
)

// CloudFrontEvent representa la estructura del evento de CloudFront
type CloudFrontEvent struct {
	Records []struct {
		CF struct {
			Request struct {
				Headers map[string][]struct {
					Key   string `json:"key"`
					Value string `json:"value"`
				} `json:"headers"`
			} `json:"request"`
		} `json:"cf"`
	} `json:"Records"`
}

// Handler es la función principal de la Lambda
func Handler(ctx context.Context, event CloudFrontEvent) (interface{}, error) {
	if len(event.Records) == 0 {
		return nil, fmt.Errorf("no records found in event")
	}

	request := event.Records[0].CF.Request
	headers := request.Headers

	// Obtener el host original
	originalHost := ""
	if hostHeaders, exists := headers["host"]; exists && len(hostHeaders) > 0 {
		originalHost = hostHeaders[0].Value
	}

	// Preservar el dominio original en un header personalizado
	headers["x-original-host"] = []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}{
		{
			Key:   "x-original-host",
			Value: originalHost,
		},
	}

	// Reemplazar el Host header con el dominio de Amplify
	headers["host"] = []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}{
		{
			Key:   "Host",
			Value: "main.d1wc36cp4amanq.amplifyapp.com",
		},
	}

	return request, nil
}

func main() {
	lambda.Start(Handler)
}