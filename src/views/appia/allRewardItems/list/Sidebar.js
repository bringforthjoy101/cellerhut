// ** Custom Components
import Sidebar from "@components/sidebar"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"

import { swal, apiRequest } from "@utils"
import { getAllData, getAllServiceId } from "../store/action"

// ** Third Party Components
import { Button, FormGroup, Label, FormText, Media } from "reactstrap"
import { AvForm, AvInput } from "availity-reactstrap-validation-safe"
import { FormattedDateParts } from "react-intl"

const sidebarNewDataPlan = ({ open, toggleSidebar }) => {
  const dispatch = useDispatch(),
    { id } = useParams()
  const store = useSelector((state) => state.appiaAllRewards)

  const [userData, setUserData] = useState({
    name: "",
    coin: "",
    type: "",
    value: "",
    qty: "",
    message: "",
    service_id: "",
    variation_code: "",
    image: null,
    image_preview: ""
  })

  // get service id
  useEffect(() => {
    dispatch(getAllServiceId())
  }, [])

  // get variation code
  const onChangeSelect = async (event) => {
    setUserData({ ...userData, service_id: event?.target?.value })
    // if (userData.service_id !== '') {
    const body = JSON.stringify({ service_id: userData.service_id })
    try {
      const response = await apiRequest({
        url: "/admin/rewards/variation-code/get",
        method: "POST",
        body
      })
      const variationCode = response.data.data.code
      if (response) {
        if (response.data.success) {
          swal("Great job!", response.data.message, "success")
          setUserData({ ...userData, variation_code: variationCode, service_id: event?.target?.value })
        } else {
          swal("Oops!", response.data.message, "error")
        }
      } else {
        swal("Oops!", "Something went wrong with your name.", "error")
      }
    } catch (error) {
      console.error({ error })
    }
    // }
  }

  // upload image
  const onClicked = async (event) => {
    event?.preventDefault()
    if (userData.image !== null) {
      const formData = new FormData()
      formData.append("image", userData.image)
      try {
        const response = await apiRequest({
          url: "/admin/upload-images",
          method: "POST",
          body: formData
        })
        const preview = response.data.data
        if (response) {
          if (response.data.success) {
            swal("Great job!", response.data.message, "success")
            setUserData({ ...userData, image_preview: preview })
          } else {
            swal("Oops!", response.data.message, "error")
          }
        } else {
          swal("Oops!", "Something went wrong with your name.", "error")
        }
      } catch (error) {
        console.error({ error })
      }
    }
  }

  // handle submit
  const onSubmit = async (event, errors) => {
    event.preventDefault()
    if (errors && !errors.length) {
      const body = JSON.stringify({
        name: userData.name,
        coin: userData.coin,
        type: userData.type,
        qty: userData.qty,
        value: userData.value,
        message: userData.message,
        service_id: userData.service_id,
        variation_code: userData.variation_code,
        image: userData.image_preview
      })
      try {
        const response = await apiRequest(
          { url: "/admin/rewards/create", method: "POST", body },
          dispatch
        )
        console.log({ response })
        if (response) {
          if (response.data.success) {
            swal("Great job!", response.data.message, "success")
            dispatch(getAllData())
          } else {
            swal("Oops!", response.data.message, "error")
          }
        } else {
          swal("Oops!", "Something went wrong with your name.", "error")
        }
      } catch (error) {
        console.error({ error })
      }
    }
  }

  return (
    <Sidebar
      size="lg"
      open={open}
      title="Create Reward"
      headerClassName="mb-1"
      contentClassName="pt-0"
      toggleSidebar={toggleSidebar}
    >
      <AvForm onSubmit={onSubmit}>
        <FormGroup>
          <Label for="name">Name</Label>
          <AvInput
            name="name"
            id="name"
            placeholder="75MB Volume of Data"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="coin">coin</Label>
          <AvInput
            name="coin"
            id="coin"
            placeholder="20"
            value={userData.coin}
            onChange={(e) => setUserData({ ...userData, coin: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="type">Type</Label>
          <AvInput
            type="select"
            id="type"
            name="type"
            value={userData.type}
            onChange={(e) => setUserData({ ...userData, type: e.target.value })}
            required
          >
            <option value="">Select Option</option>
            <option value="airtime">Airtime</option>
            <option value="data">Data</option>
            <option value="physical">Physical</option>
          </AvInput>
        </FormGroup>
        <FormGroup>
          <Label for="value">Value</Label>
          <AvInput
            name="value"
            id="value"
            placeholder="200"
            value={userData.value}
            onChange={(e) => setUserData({ ...userData, value: e.target.value })}
            required
          />
          <FormText color="muted">
            You can use letters, numbers & periods
          </FormText>
        </FormGroup>
        <FormGroup>
          <Label for="qty">Quantity</Label>
          <AvInput
            name="qty"
            id="qty"
            placeholder="10"
            value={userData.qty}
            onChange={(e) => setUserData({ ...userData, qty: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="message">Message</Label>
          <AvInput
            name="message"
            id="message"
            placeholder="30Days"
            value={userData.message}
            onChange={(e) => setUserData({ ...userData, message: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="service_id">Service Id</Label>
          <AvInput
            type="select"
            id="service_id"
            name="service_id"
            label="option"
            value={userData.service_id}
            onChange={onChangeSelect}
            required
          >
            {store.allServiceId.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </AvInput>
        </FormGroup>
        <FormGroup>
          <Label for="variation_code">Variation Code</Label>
          <AvInput
            name="variation_code"
            id="variation_code"
            placeholder=""
            value={userData.variation_code}
            onChange={(e) => setUserData({ ...userData, variation_code: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Media className="mt-75 ml-0" body>
            <div className="d-flex mt-2">
              <Button.Ripple
                tag={Label}
                className="mr-75"
                size="md"
                outline
                color="secondary"
              >
                Select an Image
                <AvInput
                  name="image"
                  id="image"
                  type="file"
                  onChange={(e) => setUserData({ ...userData, image: e.target.files[0] })}
                  hidden
                  accept="image/*"
                />
              </Button.Ripple>
              <Button.Ripple
                tag={Label}
                onClick={onClicked}
                className="mr-75"
                color="primary"
              >
                Upload Image
              </Button.Ripple>
            </div>
            <p>Allowed JPG, GIF or PNG. Max size of 800kB</p>
          </Media>
        </FormGroup>
        <Button type="submit" className="mr-1 mt-2" color="primary">
          Submit
        </Button>
        <Button
          type="reset"
          color="secondary mt-2"
          outline
          onClick={toggleSidebar}
        >
          Cancel
        </Button>
      </AvForm>
    </Sidebar>
  )
}

export default sidebarNewDataPlan
