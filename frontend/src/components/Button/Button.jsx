const Button = ({ children, className, href, ...props }) => {
  return (
    <div {...props} className={"btn " + className}>
      {children}

      <div className="hover_shape_wrapper">
        <span className="btn_hover_shape btn_hover_shape-1"></span>
        <span className="btn_hover_shape btn_hover_shape-2"></span>
        <span className="btn_hover_shape btn_hover_shape-3"></span>
      </div>
    </div>
  );
};

export default Button;
