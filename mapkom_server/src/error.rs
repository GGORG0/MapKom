use axum::{
    body::Body,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use tracing::error;

pub struct AxumReport(color_eyre::Report);

impl<E> From<E> for AxumReport
where
    E: Into<color_eyre::Report>,
{
    fn from(error: E) -> Self {
        Self(error.into())
    }
}

impl IntoResponse for AxumReport {
    fn into_response(self) -> Response<Body> {
        let body = format!(
            "<pre>500 Internal Server Error

{}
</pre>",
            ansi_to_html::convert(format!("{:?}", self.0).as_str()).unwrap_or_else(|e| {
                error!(error = ?e, "Couldn't convert error to HTML");
                htmlescape::encode_minimal(self.0.to_string().as_str())
            })
        );
        Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .header("Content-Type", "text/html")
            .body(Body::from(body))
            .unwrap_or_else(|e| format!("{:?}", e).into_response())
    }
}

pub type AxumResult<T> = std::result::Result<T, AxumReport>;

// pub struct AxumResult<T, E = AxumReport>(std::result::Result<T, E>);

// impl<T> From<color_eyre::Result<T>> for AxumResult<T> {
//     fn from(result: color_eyre::Result<T>) -> Self {
//         match result {
//             Ok(value) => Self(Ok(value)),
//             Err(report) => Self(Err(AxumReport(report))),
//         }
//     }
// }

// impl<T> IntoResponse for AxumResult<T>
// where
//     T: IntoResponse,
// {
//     fn into_response(self) -> Response<Body> {
//         match self.0 {
//             Ok(value) => value.into_response(),
//             Err(report) => report.into_response(),
//         }
//     }
// }
